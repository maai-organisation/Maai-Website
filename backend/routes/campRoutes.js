const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { pool } = require("../config/db");
const { createAdminNotifications, createNotification } = require("../utils/notifications");
const { sendTemplateEmail } = require("../utils/emailService");

const router = express.Router();
const manageCamps = authorizeRoles("superadmin", "it_staff");
const campTypes = new Set(["health", "awareness", "screening", "research", "education", "community", "other"]);
const statuses = new Set(["submitted", "under_review", "approved", "rejected", "completed"]);
const ngoRoles = new Set(["ngo", "ngo_admin"]);

function cleanString(value, maxLength = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanLongText(value, maxLength = 5000) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, maxLength);
}

function mapCampRequest(row) {
  return {
    id: row.id,
    ngoId: row.ngo_id,
    ngoName: row.organization_name,
    ngoEmail: row.ngo_email,
    title: row.title || row.camp_name,
    campTitle: row.title || row.camp_name,
    campType: row.camp_type,
    description: row.description,
    location: row.location,
    city: row.city,
    state: row.state,
    proposedDate: row.proposed_date,
    expectedBeneficiaries: row.expected_beneficiaries,
    beneficiaries: row.expected_beneficiaries ?? row.beneficiaries,
    volunteersRequired: row.volunteers_required,
    resourcesNeeded: row.resources_needed,
    status: row.status,
    reviewNotes: row.review_notes,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeCampRequest(input = {}) {
  const campType = campTypes.has(input.campType || input.camp_type) ? input.campType || input.camp_type : "other";
  const data = {
    title: cleanString(input.title || input.campTitle || input.campName || input.camp_name, 220),
    campType,
    description: cleanLongText(input.description),
    location: cleanString(input.location, 220),
    city: cleanString(input.city, 120),
    state: cleanString(input.state, 120),
    proposedDate: cleanString(input.proposedDate || input.proposed_date, 20) || null,
    expectedBeneficiaries: Number(input.expectedBeneficiaries || input.expected_beneficiaries || input.beneficiaries || 0),
    volunteersRequired: Number(input.volunteersRequired || input.volunteers_required || 0),
    resourcesNeeded: cleanLongText(input.resourcesNeeded || input.resources_needed, 3000) || null,
  };
  const errors = {};
  if (!data.title) errors.title = "Camp title is required.";
  if (!data.description) errors.description = "Description is required.";
  if (!data.location) errors.location = "Location is required.";
  if (!data.city) errors.city = "City is required.";
  if (!data.proposedDate) errors.proposedDate = "Proposed date is required.";
  if (!data.expectedBeneficiaries) errors.expectedBeneficiaries = "Expected beneficiaries is required.";
  return { data, errors };
}

async function logAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    "INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata_json) VALUES (?, ?, 'camp_request', ?, ?)",
    [ngoRoles.has(req.user.role) ? null : req.user.id, `camp_requests.${action}`, entityId, JSON.stringify(metadata)],
  );
}

router.get(
  "/requests",
  requireAuth,
  asyncHandler(async (req, res) => {
    const admin = req.user.role === "superadmin" || req.user.role === "it_staff";
    const search = cleanString(req.query.search, 180);
    const campType = cleanString(req.query.type || req.query.campType || req.query.camp_type, 40);
    const status = cleanString(req.query.status, 40);
    const city = cleanString(req.query.city, 120);
    const state = cleanString(req.query.state, 120);
    const filters = [];
    const values = [];

    if (!admin) {
      if (!ngoRoles.has(req.user.role)) return res.status(403).json({ success: false, message: "NGO account required." });
      filters.push("cr.ngo_id = ?");
      values.push(req.user.id);
    }
    if (search) {
      filters.push("(cr.title LIKE ? OR cr.location LIKE ? OR n.organization_name LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like);
    }
    if (campType && campType !== "all") {
      filters.push("cr.camp_type = ?");
      values.push(campType);
    }
    if (status && status !== "all") {
      filters.push("cr.status = ?");
      values.push(status);
    }
    if (city && city !== "all") {
      filters.push("cr.city = ?");
      values.push(city);
    }
    if (state && state !== "all") {
      filters.push("cr.state = ?");
      values.push(state);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT cr.*, n.organization_name, n.email AS ngo_email
        FROM camp_requests cr
        LEFT JOIN ngos n ON n.id = cr.ngo_id
        ${where}
        ORDER BY cr.created_at DESC
      `,
      values,
    );
    res.json({ success: true, data: rows.map(mapCampRequest) });
  }),
);

router.post(
  "/requests",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!ngoRoles.has(req.user.role)) return res.status(403).json({ success: false, message: "NGO account required." });
    const { data, errors } = normalizeCampRequest(req.body);
    if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });

    const [result] = await pool.query(
      `
        INSERT INTO camp_requests
          (ngo_id, title, camp_name, camp_type, description, location, city, state, proposed_date, expected_beneficiaries, beneficiaries, volunteers_required, resources_needed, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
      `,
      [
        req.user.id,
        data.title,
        data.title,
        data.campType,
        data.description,
        data.location,
        data.city,
        data.state,
        data.proposedDate,
        data.expectedBeneficiaries,
        String(data.expectedBeneficiaries),
        data.volunteersRequired,
        data.resourcesNeeded,
      ],
    );
    await logAudit(req, "submit", result.insertId);
    await createAdminNotifications({
      title: "Camp request submitted",
      message: `${data.title} was submitted by ${req.user.organizationName || req.user.organization_name || "an NGO"}.`,
      notificationType: "camp_request",
      actionUrl: "/admin/camp-requests",
    });
    res.status(201).json({ success: true, data: { id: result.insertId, ...data, status: "submitted" } });
  }),
);

router.put(
  "/requests/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!ngoRoles.has(req.user.role)) return res.status(403).json({ success: false, message: "NGO account required." });
    const { data, errors } = normalizeCampRequest(req.body);
    if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });

    const [result] = await pool.query(
      `
        UPDATE camp_requests
        SET title = ?, camp_name = ?, camp_type = ?, description = ?, location = ?, city = ?, state = ?,
            proposed_date = ?, expected_beneficiaries = ?, beneficiaries = ?, volunteers_required = ?, resources_needed = ?
        WHERE id = ? AND ngo_id = ? AND status IN ('submitted', 'under_review')
      `,
      [
        data.title,
        data.title,
        data.campType,
        data.description,
        data.location,
        data.city,
        data.state,
        data.proposedDate,
        data.expectedBeneficiaries,
        String(data.expectedBeneficiaries),
        data.volunteersRequired,
        data.resourcesNeeded,
        req.params.id,
        req.user.id,
      ],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Camp request not editable or not found." });
    res.json({ success: true });
  }),
);

router.patch(
  "/requests/:id/cancel",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!ngoRoles.has(req.user.role)) return res.status(403).json({ success: false, message: "NGO account required." });
    const [result] = await pool.query("UPDATE camp_requests SET status = 'rejected', review_notes = 'Cancelled by NGO' WHERE id = ? AND ngo_id = ? AND status IN ('submitted', 'under_review')", [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Camp request not cancellable or not found." });
    res.json({ success: true });
  }),
);

router.patch(
  "/requests/:id/review",
  requireAuth,
  manageCamps,
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!statuses.has(status)) return res.status(400).json({ success: false, message: "Invalid camp request status." });
    const reviewNotes = cleanLongText(req.body?.reviewNotes || req.body?.review_notes, 3000) || null;

    const [result] = await pool.query(
      "UPDATE camp_requests SET status = ?, review_notes = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
      [status, reviewNotes, req.user.id, req.params.id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Camp request not found." });
    if (status === "approved" || status === "rejected") {
      const [rows] = await pool.query(
        `
          SELECT cr.ngo_id, cr.volunteer_id, cr.title, cr.camp_name, n.organization_name, n.email AS ngo_email, v.full_name AS volunteer_name, v.email AS volunteer_email
          FROM camp_requests cr
          LEFT JOIN ngos n ON n.id = cr.ngo_id
          LEFT JOIN volunteers v ON v.id = cr.volunteer_id
          WHERE cr.id = ?
          LIMIT 1
        `,
        [req.params.id],
      );
      const request = rows[0];
      if (request?.ngo_id) {
        await pool.query(
          "INSERT INTO ngo_notifications (ngo_id, title, message, notification_type) VALUES (?, ?, ?, 'camp_request')",
          [
            request.ngo_id,
            status === "approved" ? "Camp request approved" : "Camp request rejected",
            `${request.title || request.camp_name} has been ${status}.${reviewNotes ? ` Notes: ${reviewNotes}` : ""}`,
          ],
        );
        await createNotification({
          recipientType: "ngo",
          recipientId: request.ngo_id,
          title: status === "approved" ? "Camp request approved" : "Camp request rejected",
          message: `${request.title || request.camp_name} has been ${status}.${reviewNotes ? ` Notes: ${reviewNotes}` : ""}`,
          notificationType: "camp_request",
          actionUrl: "/ngo/dashboard/camp-requests",
        });
      }
      const recipientEmail = request?.ngo_email || request?.volunteer_email;
      if (recipientEmail) {
        await sendTemplateEmail({
          emailType: status === "approved" ? "camp_approved" : "camp_rejected",
          to: recipientEmail,
          recipientType: request.ngo_id ? "ngo" : "volunteer",
          recipientId: request.ngo_id || request.volunteer_id,
          variables: {
            full_name: request.organization_name || request.volunteer_name || "Maai member",
            event_name: request.title || request.camp_name,
            certificate_name: "",
            membership_status: status,
          },
          metadata: { campRequestId: req.params.id, reviewNotes },
        });
      }
    }
    await logAudit(req, status === "approved" ? "approve" : status === "rejected" ? "reject" : status, req.params.id, { reviewNotes });
    res.json({ success: true });
  }),
);

router.get(
  "/notifications",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!ngoRoles.has(req.user.role)) return res.status(403).json({ success: false, message: "NGO account required." });
    const [rows] = await pool.query(
      `
        SELECT *
        FROM ngo_notifications
        WHERE ngo_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [req.user.id],
    );
    res.json({ success: true, data: rows });
  }),
);

router.post(
  "/requests/:id/convert-to-event",
  requireAuth,
  manageCamps,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM camp_requests WHERE id = ? LIMIT 1", [req.params.id]);
    const request = rows[0];
    if (!request) return res.status(404).json({ success: false, message: "Camp request not found." });
    if (request.status !== "approved") return res.status(400).json({ success: false, message: "Only approved camp requests can become events." });

    const [result] = await pool.query(
      `
        INSERT INTO events
          (title, slug, description, event_type, start_datetime, location, visibility, status, certificate_enabled, ngo_id, camp_request_id, created_by)
        VALUES (?, ?, ?, 'camp', ?, ?, 'members_only', 'published', 1, ?, ?, ?)
      `,
      [
        request.title || request.camp_name,
        String(request.title || request.camp_name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        request.description,
        request.proposed_date,
        request.location,
        request.ngo_id,
        request.id,
        req.user.id,
      ],
    );
    await logAudit(req, "convert_to_event", req.params.id, { eventId: result.insertId });
    if (request.ngo_id) {
      await createNotification({
        recipientType: "ngo",
        recipientId: request.ngo_id,
        title: "Camp converted to event",
        message: `${request.title || request.camp_name} is now linked to a Maai event.`,
        notificationType: "event",
        actionUrl: "/ngo/dashboard",
      });
    }
    res.status(201).json({ success: true, data: { eventId: result.insertId } });
  }),
);

router.post(
  "/request",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeCampRequest(req.body);
    if (Object.keys(errors).length > 0) return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    const ngoId = ngoRoles.has(req.user.role) ? req.user.id : null;
    const [result] = await pool.query(
      `
        INSERT INTO camp_requests
          (ngo_id, volunteer_id, title, camp_name, camp_type, description, location, city, state, proposed_date, expected_beneficiaries, beneficiaries, volunteers_required, resources_needed, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')
      `,
      [ngoId, ngoId ? null : req.user.id, data.title, data.title, data.campType, data.description, data.location, data.city, data.state, data.proposedDate, data.expectedBeneficiaries, String(data.expectedBeneficiaries), data.volunteersRequired, data.resourcesNeeded],
    );
    await createAdminNotifications({
      title: "Camp request submitted",
      message: `${data.title} was submitted for review.`,
      notificationType: "camp_request",
      actionUrl: "/admin/camp-requests",
    });
    res.status(201).json({ success: true, data: { id: result.insertId, ...data, status: "submitted" } });
  }),
);

module.exports = router;
