const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { pool } = require("../config/db");
const { createAdminNotifications } = require("../utils/notifications");

const router = express.Router();
const ngoRoles = new Set(["ngo", "ngo_admin"]);
const adminRoles = new Set(["superadmin", "it_staff"]);
const campTypes = new Set(["health", "awareness", "screening", "research", "education", "community", "other"]);
const campStatuses = new Set(["draft", "submitted", "under_review", "approved", "scheduled", "completed", "rejected"]);

function requireNgoAdmin(req, res, next) {
  if (!req.user || (!ngoRoles.has(req.user.role) && !adminRoles.has(req.user.role))) {
    return res.status(403).json({ success: false, message: "NGO dashboard access is required." });
  }
  return next();
}

function cleanString(value, maxLength = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanLongText(value, maxLength = 5000) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, maxLength);
}

function mapCamp(row) {
  return {
    id: row.id,
    ngoId: row.ngo_id,
    ngoName: row.organization_name,
    title: row.title,
    campType: row.camp_type,
    description: row.description,
    location: row.location,
    city: row.city,
    state: row.state,
    proposedDate: row.proposed_date,
    scheduledDate: row.scheduled_date,
    expectedBeneficiaries: row.expected_beneficiaries,
    volunteersRequired: row.volunteers_required,
    resourcesNeeded: row.resources_needed,
    status: row.status,
    workflowStep: row.workflow_step,
    reviewNotes: row.review_notes,
    documentsCount: Number(row.documents_count || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDocument(row) {
  return {
    id: row.id,
    campId: row.camp_id,
    documentType: row.document_type,
    fileName: row.file_name,
    mimeType: row.mime_type,
    fileSize: row.file_size,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

function normalizeCamp(input = {}) {
  const rawType = input.campType || input.camp_type;
  const campType = campTypes.has(rawType) ? rawType : "other";
  const data = {
    title: cleanString(input.title || input.campTitle || input.camp_name, 220),
    campType,
    description: cleanLongText(input.description),
    location: cleanString(input.location, 220),
    city: cleanString(input.city, 120),
    state: cleanString(input.state, 120),
    proposedDate: cleanString(input.proposedDate || input.proposed_date, 20) || null,
    scheduledDate: cleanString(input.scheduledDate || input.scheduled_date, 20) || null,
    expectedBeneficiaries: Number(input.expectedBeneficiaries || input.expected_beneficiaries || 0),
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

function buildCampWhere(req) {
  const filters = [];
  const values = [];

  if (ngoRoles.has(req.user.role)) {
    filters.push("nc.ngo_id = ?");
    values.push(req.user.id);
  }

  const status = cleanString(req.query.status, 40);
  if (status && status !== "all") {
    filters.push("nc.status = ?");
    values.push(status);
  }

  const search = cleanString(req.query.search, 180);
  if (search) {
    filters.push("(nc.title LIKE ? OR nc.location LIKE ? OR nc.city LIKE ?)");
    const like = `%${search}%`;
    values.push(like, like, like);
  }

  return {
    where: filters.length ? `WHERE ${filters.join(" AND ")}` : "",
    values,
  };
}

router.use(requireAuth, requireNgoAdmin);

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const ngoFilter = ngoRoles.has(req.user.role) ? "WHERE ngo_id = ?" : "";
    const values = ngoRoles.has(req.user.role) ? [req.user.id] : [];
    const [rows] = await pool.query(
      `
        SELECT
          COUNT(*) AS total,
          SUM(status IN ('submitted', 'under_review')) AS active_requests,
          SUM(status IN ('approved', 'scheduled')) AS approved,
          SUM(status = 'completed') AS completed,
          SUM(status = 'rejected') AS rejected
        FROM ngo_camps
        ${ngoFilter}
      `,
      values,
    );

    const [documentRows] = await pool.query(
      `
        SELECT COUNT(*) AS total
        FROM ngo_camp_documents ncd
        INNER JOIN ngo_camps nc ON nc.id = ncd.camp_id
        ${ngoRoles.has(req.user.role) ? "WHERE nc.ngo_id = ?" : ""}
      `,
      values,
    );

    res.json({
      success: true,
      data: {
        total: Number(rows[0]?.total || 0),
        activeRequests: Number(rows[0]?.active_requests || 0),
        approved: Number(rows[0]?.approved || 0),
        completed: Number(rows[0]?.completed || 0),
        rejected: Number(rows[0]?.rejected || 0),
        documents: Number(documentRows[0]?.total || 0),
      },
    });
  }),
);

router.get(
  "/camps",
  asyncHandler(async (req, res) => {
    const { where, values } = buildCampWhere(req);
    const [rows] = await pool.query(
      `
        SELECT nc.*, n.organization_name, COUNT(ncd.id) AS documents_count
        FROM ngo_camps nc
        LEFT JOIN ngos n ON n.id = nc.ngo_id
        LEFT JOIN ngo_camp_documents ncd ON ncd.camp_id = nc.id
        ${where}
        GROUP BY nc.id
        ORDER BY nc.created_at DESC
      `,
      values,
    );
    res.json({ success: true, data: rows.map(mapCamp) });
  }),
);

router.post(
  "/camps",
  asyncHandler(async (req, res) => {
    if (!ngoRoles.has(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only NGO admins can organise camps." });
    }

    const { data, errors } = normalizeCamp(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        INSERT INTO ngo_camps
          (ngo_id, title, camp_type, description, location, city, state, proposed_date, scheduled_date, expected_beneficiaries, volunteers_required, resources_needed, status, workflow_step)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 2)
      `,
      [
        req.user.id,
        data.title,
        data.campType,
        data.description,
        data.location,
        data.city,
        data.state,
        data.proposedDate,
        data.scheduledDate,
        data.expectedBeneficiaries,
        data.volunteersRequired,
        data.resourcesNeeded,
      ],
    );

    await createAdminNotifications({
      title: "NGO camp submitted",
      message: `${data.title} was organised by ${req.user.organizationName || req.user.organization_name || "an NGO"}.`,
      notificationType: "camp_request",
      actionUrl: "/admin/camp-requests",
    });

    res.status(201).json({ success: true, data: { id: result.insertId, ...data, status: "submitted", workflowStep: 2 } });
  }),
);

router.patch(
  "/camps/:id/status",
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!campStatuses.has(status)) return res.status(400).json({ success: false, message: "Invalid camp status." });

    const workflowStep = {
      draft: 1,
      submitted: 2,
      under_review: 3,
      approved: 4,
      scheduled: 5,
      completed: 6,
      rejected: 6,
    }[status];
    const reviewNotes = cleanLongText(req.body?.reviewNotes || req.body?.review_notes, 3000) || null;
    const values = [status, workflowStep, reviewNotes, req.params.id];
    const ownerFilter = ngoRoles.has(req.user.role) ? "AND ngo_id = ?" : "";
    if (ngoRoles.has(req.user.role)) values.push(req.user.id);

    const [result] = await pool.query(
      `
        UPDATE ngo_camps
        SET status = ?, workflow_step = ?, review_notes = COALESCE(?, review_notes)
        WHERE id = ? ${ownerFilter}
      `,
      values,
    );

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Camp not found." });
    res.json({ success: true });
  }),
);

router.get(
  "/camps/:id/documents",
  asyncHandler(async (req, res) => {
    const values = [req.params.id];
    const ownerFilter = ngoRoles.has(req.user.role) ? "AND nc.ngo_id = ?" : "";
    if (ngoRoles.has(req.user.role)) values.push(req.user.id);
    const [rows] = await pool.query(
      `
        SELECT ncd.*
        FROM ngo_camp_documents ncd
        INNER JOIN ngo_camps nc ON nc.id = ncd.camp_id
        WHERE ncd.camp_id = ? ${ownerFilter}
        ORDER BY ncd.created_at DESC
      `,
      values,
    );
    res.json({ success: true, data: rows.map(mapDocument) });
  }),
);

router.post(
  "/camps/:id/documents",
  asyncHandler(async (req, res) => {
    if (!ngoRoles.has(req.user.role)) {
      return res.status(403).json({ success: false, message: "Only NGO admins can upload documents." });
    }

    const fileName = cleanString(req.body?.fileName || req.body?.file_name, 255);
    const mimeType = cleanString(req.body?.mimeType || req.body?.mime_type || "application/octet-stream", 120);
    const documentType = cleanString(req.body?.documentType || req.body?.document_type || "supporting", 80);
    const fileData = String(req.body?.fileData || req.body?.file_data || "");
    const fileSize = Number(req.body?.fileSize || req.body?.file_size || 0);

    if (!fileName || !fileData) {
      return res.status(400).json({ success: false, message: "File name and file data are required." });
    }

    const [campRows] = await pool.query("SELECT id FROM ngo_camps WHERE id = ? AND ngo_id = ? LIMIT 1", [
      req.params.id,
      req.user.id,
    ]);
    if (campRows.length === 0) return res.status(404).json({ success: false, message: "Camp not found." });

    const [result] = await pool.query(
      `
        INSERT INTO ngo_camp_documents
          (camp_id, document_type, file_name, mime_type, file_size, file_data, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [req.params.id, documentType, fileName, mimeType, fileSize, fileData, req.user.id],
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        campId: Number(req.params.id),
        documentType,
        fileName,
        mimeType,
        fileSize,
        uploadedBy: req.user.id,
      },
    });
  }),
);

module.exports = router;
