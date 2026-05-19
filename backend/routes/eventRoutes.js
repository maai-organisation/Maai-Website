const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { pool } = require("../config/db");
const { createNotification, createVolunteerNotifications } = require("../utils/notifications");
const { sendTemplateEmail } = require("../utils/emailService");

const router = express.Router();
const manageEvents = authorizeRoles("superadmin", "it_staff");
const eventTypes = new Set(["camp", "workshop", "awareness", "conference", "research", "meeting", "training", "other"]);
const eventVisibilities = new Set(["public", "members_only", "internal"]);
const eventStatuses = new Set(["draft", "published", "completed", "cancelled", "archived"]);
const attendanceStatuses = new Set(["registered", "attended", "absent"]);
const participationStatuses = new Set(["registered", "participated", "completed", "cancelled"]);
const eventSortColumns = new Set(["title", "event_type", "location", "start_datetime", "visibility", "status", "certificate_enabled", "created_at"]);

function cleanString(value, maxLength = 1000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanLongText(value, maxLength = 5000) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, maxLength);
}

function toBoolean(value) {
  return value === true || value === 1 || ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 220);
}

function cleanOptionalUrl(value, label) {
  const url = cleanString(value, 2000);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
    return url;
  } catch {
    const error = new Error(`${label} must be a valid public http(s) URL.`);
    error.statusCode = 400;
    throw error;
  }
}

function normalizeEvent(input = {}) {
  const title = cleanString(input.title, 220);
  const slug = slugify(input.slug || title);
  const eventType = eventTypes.has(input.eventType || input.event_type) ? input.eventType || input.event_type : "other";
  const visibility = eventVisibilities.has(input.visibility) ? input.visibility : "members_only";
  const status = eventStatuses.has(input.status) ? input.status : "draft";
  const errors = {};

  if (!title) errors.title = "Event title is required.";
  if (!slug) errors.slug = "Slug is required.";

  return {
    data: {
      title,
      slug,
      eventType,
      description: cleanLongText(input.description),
      bannerUrl: cleanOptionalUrl(input.bannerUrl || input.banner_url, "Banner URL"),
      location: cleanString(input.location, 220) || null,
      startDatetime: cleanString(input.startDatetime || input.start_datetime || input.eventDate || input.event_date, 40) || null,
      endDatetime: cleanString(input.endDatetime || input.end_datetime, 40) || null,
      capacity: input.capacity === "" || input.capacity === undefined || input.capacity === null ? null : Number(input.capacity),
      visibility,
      status,
      certificateEnabled: toBoolean(input.certificateEnabled ?? input.certificate_enabled),
      certificateTemplateId: input.certificateTemplateId || input.certificate_template_id || null,
      initiativeId: input.initiativeId || input.initiative_id || null,
    },
    errors,
  };
}

function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    eventType: row.event_type,
    event_type: row.event_type,
    description: row.description,
    bannerUrl: row.banner_url,
    banner_url: row.banner_url,
    location: row.location,
    eventDate: row.event_date,
    startDatetime: row.start_datetime,
    start_datetime: row.start_datetime,
    endDatetime: row.end_datetime,
    end_datetime: row.end_datetime,
    capacity: row.capacity,
    visibility: row.visibility,
    status: row.status,
    certificateEnabled: Boolean(row.certificate_enabled),
    certificate_enabled: Boolean(row.certificate_enabled),
    certificateTemplateId: row.certificate_template_id,
    initiativeId: row.initiative_id,
    initiative_id: row.initiative_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapParticipant(row) {
  const participationStatus =
    row.participation_status ||
    (row.attendance_status === "attended" ? "participated" : row.attendance_status === "absent" ? "cancelled" : "registered");
  return {
    id: row.id,
    eventId: row.event_id,
    volunteerId: row.volunteer_id,
    role: row.role,
    attendanceStatus: participationStatus,
    attendance_status: row.attendance_status,
    participationStatus,
    participation_status: participationStatus,
    completedAt: row.completed_at,
    completed_at: row.completed_at,
    joinedAt: row.joined_at,
    joined_at: row.joined_at,
    addedBy: row.added_by,
    createdAt: row.created_at,
    fullName: row.full_name,
    full_name: row.full_name,
    email: row.email,
  };
}

function mapCertificate(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    volunteerId: row.volunteer_id,
    certificateType: row.certificate_type,
    status: row.status,
    verificationCode: row.verification_code,
    issuedBy: row.issued_by,
    claimedAt: row.claimed_at,
    issuedAt: row.issued_at,
    createdAt: row.created_at,
    fullName: row.full_name,
    email: row.email,
  };
}

function mapCertificateRecipient(row) {
  return {
    volunteerId: row.volunteer_id,
    fullName: row.full_name,
    email: row.email,
    membershipStatus: row.membership_status,
    certificateId: row.certificate_id,
    certificateType: row.certificate_type,
    certificateStatus: row.certificate_status,
    verificationCode: row.verification_code,
    issuedAt: row.issued_at,
    claimedAt: row.claimed_at,
  };
}

function mapMyCamp(row) {
  const participationStatus =
    row.participation_status ||
    (row.attendance_status === "attended" ? "participated" : row.attendance_status === "absent" ? "cancelled" : "registered");
  return {
    id: row.event_id,
    eventId: row.event_id,
    participantId: row.participant_id,
    title: row.title,
    campTitle: row.title,
    eventType: row.event_type,
    event_type: row.event_type,
    description: row.description,
    bannerUrl: row.banner_url,
    banner_url: row.banner_url,
    date: row.start_datetime || row.event_date,
    startDatetime: row.start_datetime,
    start_datetime: row.start_datetime,
    endDatetime: row.end_datetime,
    end_datetime: row.end_datetime,
    location: row.location,
    status: row.status,
    participationStatus,
    participation_status: participationStatus,
    joinedAt: row.joined_at,
    joined_at: row.joined_at,
    completedAt: row.completed_at,
    completed_at: row.completed_at,
    certificateId: row.certificate_id,
    certificate_id: row.certificate_id,
    certificateStatus: row.certificate_status || "none",
    certificate_status: row.certificate_status || "none",
    verificationCode: row.verification_code,
    verification_code: row.verification_code,
    ngoId: row.ngo_id,
    ngo_id: row.ngo_id,
    chapter: row.chapter || null,
    impactScore: row.impact_score || null,
    impact_score: row.impact_score || null,
    feedback: row.feedback || null,
  };
}

async function logEventAudit(req, action, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, 'event', ?, ?)
    `,
    [req.user.id, `events.${action}`, entityId, JSON.stringify(metadata)],
  );
}

async function loadEvent(id) {
  const [rows] = await pool.query("SELECT * FROM events WHERE id = ? LIMIT 1", [id]);
  return rows[0];
}

async function loadVolunteer(id) {
  const [rows] = await pool.query("SELECT id, full_name, email, membership_status FROM volunteers WHERE id = ? LIMIT 1", [id]);
  return rows[0];
}

async function notifyPublishedEvent(event) {
  if (!event || event.status !== "published") return;
  await createVolunteerNotifications("WHERE membership_status = 'verified' AND role = 'volunteer'", [], {
    title: "New event created",
    message: `${event.title} is now available in Maai events.`,
    notificationType: "event",
    actionUrl: "/volunteer/events",
  });
  const [volunteers] = await pool.query("SELECT id, full_name, email, membership_status FROM volunteers WHERE membership_status = 'verified' AND role = 'volunteer' AND email IS NOT NULL");
  await Promise.all(
    volunteers.map((volunteer) =>
      sendTemplateEmail({
        emailType: "event_created",
        to: volunteer.email,
        variables: {
          full_name: volunteer.full_name,
          event_name: event.title,
          certificate_name: "",
          membership_status: volunteer.membership_status,
          camp_name: event.title,
          ngo_name: "",
          verification_code: "",
        },
      }),
    ),
  );
}

function newCertificateCode() {
  return `MAAI-EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

router.get(
  "/volunteers",
  requireAuth,
  manageEvents,
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(`
      SELECT id, full_name, email, phone, city, college, course, academic_year, membership_status, role
      FROM volunteers
      ORDER BY full_name ASC
    `);

    res.json({ success: true, data: rows });
  }),
);

router.get(
  "/my",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `
        SELECT e.*, ep.id AS participant_id, ep.attendance_status, ep.participation_status, ep.completed_at,
          ec.id AS certificate_id, ec.status AS certificate_status
        FROM event_participants ep
        INNER JOIN events e ON e.id = ep.event_id
        LEFT JOIN event_certificates ec
          ON ec.event_id = e.id
         AND ec.volunteer_id = ep.volunteer_id
         AND ec.certificate_type = 'event'
        WHERE ep.volunteer_id = ?
        ORDER BY COALESCE(e.start_datetime, e.event_date, e.created_at) DESC
      `,
      [req.user.id],
    );

    res.json({
      success: true,
      data: rows.map((row) => ({
        ...mapEvent(row),
        participantId: row.participant_id,
        attendanceStatus: row.participation_status || row.attendance_status,
        participationStatus: row.participation_status || row.attendance_status,
        completedAt: row.completed_at,
        certificateId: row.certificate_id,
        certificateStatus: row.certificate_status,
      })),
    });
  }),
);

router.get(
  "/my-camps",
  requireAuth,
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const filter = cleanString(req.query.filter, 40);
    const filters = ["ep.volunteer_id = ?"];
    const values = [req.user.id];

    if (search) {
      filters.push("(e.title LIKE ? OR e.location LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like);
    }
    if (filter === "certificates") filters.push("ec.id IS NOT NULL AND ec.status <> 'revoked'");
    if (filter === "no_certificate") filters.push("(ec.id IS NULL OR ec.status = 'revoked')");
    if (filter === "completed") filters.push("ep.participation_status IN ('participated', 'completed')");
    if (filter === "upcoming") filters.push("(e.start_datetime IS NULL OR e.start_datetime >= NOW()) AND ep.participation_status = 'registered'");

    const [rows] = await pool.query(
      `
        SELECT
          e.id AS event_id,
          e.title,
          e.description,
          e.event_type,
          e.banner_url,
          e.event_date,
          e.start_datetime,
          e.end_datetime,
          e.location,
          e.status,
          e.ngo_id,
          ep.id AS participant_id,
          ep.attendance_status,
          ep.participation_status,
          ep.joined_at,
          ep.completed_at,
          ec.id AS certificate_id,
          ec.status AS certificate_status,
          ec.verification_code
        FROM event_participants ep
        INNER JOIN events e ON e.id = ep.event_id
        LEFT JOIN event_certificates ec
          ON ec.event_id = e.id
         AND ec.volunteer_id = ep.volunteer_id
         AND ec.certificate_type = 'event'
        WHERE ${filters.join(" AND ")}
        ORDER BY COALESCE(e.start_datetime, e.event_date, ep.joined_at) DESC
      `,
      values,
    );

    res.json({ success: true, data: rows.map(mapMyCamp) });
  }),
);

router.get(
  "/my-camps/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `
        SELECT
          e.id AS event_id,
          e.title,
          e.description,
          e.event_type,
          e.banner_url,
          e.event_date,
          e.start_datetime,
          e.end_datetime,
          e.location,
          e.status,
          e.ngo_id,
          ep.id AS participant_id,
          ep.attendance_status,
          ep.participation_status,
          ep.joined_at,
          ep.completed_at,
          ec.id AS certificate_id,
          ec.status AS certificate_status,
          ec.verification_code
        FROM event_participants ep
        INNER JOIN events e ON e.id = ep.event_id
        LEFT JOIN event_certificates ec
          ON ec.event_id = e.id
         AND ec.volunteer_id = ep.volunteer_id
         AND ec.certificate_type = 'event'
        WHERE ep.volunteer_id = ?
          AND e.id = ?
        LIMIT 1
      `,
      [req.user.id, req.params.id],
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Camp participation not found." });
    res.json({ success: true, data: mapMyCamp(rows[0]) });
  }),
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const admin = req.user.role === "superadmin" || req.user.role === "it_staff";
    const search = cleanString(req.query.search, 180);
    const eventType = cleanString(req.query.type || req.query.eventType || req.query.event_type, 40);
    const status = cleanString(req.query.status, 40);
    const visibility = cleanString(req.query.visibility, 40);
    const certificateEnabled = cleanString(req.query.certificateEnabled || req.query.certificate_enabled, 20);
    const sort = eventSortColumns.has(req.query.sort) ? req.query.sort : "start_datetime";
    const direction = String(req.query.direction || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const filters = [];
    const values = [];

    if (!admin) filters.push("status = 'published'");
    if (eventType && eventType !== "all") {
      filters.push("event_type = ?");
      values.push(eventType);
    }
    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (visibility && visibility !== "all") {
      filters.push("visibility = ?");
      values.push(visibility);
    }
    if (certificateEnabled && certificateEnabled !== "all") {
      filters.push("certificate_enabled = ?");
      values.push(certificateEnabled === "true" || certificateEnabled === "enabled" ? 1 : 0);
    }
    if (search) {
      filters.push("(title LIKE ? OR event_type LIKE ? OR location LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT *
        FROM events
        ${where}
        ORDER BY ${sort} ${direction}, created_at DESC
      `,
      values,
    );

    res.json({ success: true, data: rows.map(mapEvent) });
  }),
);

router.post(
  "/",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeEvent(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        INSERT INTO events
          (title, slug, description, event_type, banner_url, event_date, start_datetime, end_datetime, location, capacity, visibility, status, certificate_enabled, certificate_template_id, initiative_id, created_by)
        VALUES (?, ?, ?, ?, ?, DATE(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        data.slug,
        data.description,
        data.eventType,
        data.bannerUrl,
        data.startDatetime,
        data.startDatetime,
        data.endDatetime,
        data.location,
        data.capacity,
        data.visibility,
        data.status,
        data.certificateEnabled ? 1 : 0,
        data.certificateTemplateId,
        data.initiativeId,
        req.user.id,
      ],
    );

    await logEventAudit(req, "create", result.insertId, { status: data.status, eventType: data.eventType });
    if (data.status === "published") await logEventAudit(req, "publish", result.insertId);
    const createdEvent = await loadEvent(result.insertId);
    await notifyPublishedEvent(createdEvent);
    res.status(201).json({ success: true, data: mapEvent(createdEvent) });
  }),
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const event = await loadEvent(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    const [participants] = await pool.query(
      `
        SELECT ep.*, v.full_name, v.email
        FROM event_participants ep
        INNER JOIN volunteers v ON v.id = ep.volunteer_id
        WHERE ep.event_id = ?
        ORDER BY v.full_name ASC
      `,
      [req.params.id],
    );

    const [certificates] = await pool.query(
      `
        SELECT ec.*, v.full_name, v.email
        FROM event_certificates ec
        INNER JOIN volunteers v ON v.id = ec.volunteer_id
        WHERE ec.event_id = ?
        ORDER BY ec.created_at DESC
      `,
      [req.params.id],
    );

    res.json({
      success: true,
      data: {
        ...mapEvent(event),
        participants: participants.map(mapParticipant),
        certificates: certificates.map(mapCertificate),
      },
    });
  }),
);

router.put(
  "/:id",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const event = await loadEvent(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    const { data, errors } = normalizeEvent(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    await pool.query(
      `
        UPDATE events
        SET title = ?,
            slug = ?,
            description = ?,
            event_type = ?,
            banner_url = ?,
            event_date = DATE(?),
            start_datetime = ?,
            end_datetime = ?,
            location = ?,
            capacity = ?,
            visibility = ?,
            status = ?,
            certificate_enabled = ?,
            certificate_template_id = ?,
            initiative_id = ?
        WHERE id = ?
      `,
      [
        data.title,
        data.slug,
        data.description,
        data.eventType,
        data.bannerUrl,
        data.startDatetime,
        data.startDatetime,
        data.endDatetime,
        data.location,
        data.capacity,
        data.visibility,
        data.status,
        data.certificateEnabled ? 1 : 0,
        data.certificateTemplateId,
        data.initiativeId,
        req.params.id,
      ],
    );

    await logEventAudit(req, "edit", req.params.id, { status: data.status, eventType: data.eventType });
    if (data.status === "published") await logEventAudit(req, "publish", req.params.id);
    const updatedEvent = await loadEvent(req.params.id);
    if (event.status !== "published" && updatedEvent.status === "published") await notifyPublishedEvent(updatedEvent);
    res.json({ success: true, data: mapEvent(updatedEvent) });
  }),
);

router.patch(
  "/:id/status",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!eventStatuses.has(status)) return res.status(400).json({ success: false, message: "Invalid event status." });

    const [result] = await pool.query("UPDATE events SET status = ? WHERE id = ?", [status, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Event not found." });

    await logEventAudit(req, status === "published" ? "publish" : status === "completed" ? "complete" : status === "archived" ? "archive" : status, req.params.id);
    const updatedEvent = await loadEvent(req.params.id);
    if (status === "published") await notifyPublishedEvent(updatedEvent);
    res.json({ success: true, data: mapEvent(updatedEvent) });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("DELETE FROM events WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Event not found." });
    await logEventAudit(req, "delete", req.params.id);
    res.json({ success: true });
  }),
);

router.post(
  "/:id/participants",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const volunteerId = Number(req.body?.volunteerId || req.body?.volunteer_id);
    if (!volunteerId) return res.status(400).json({ success: false, message: "Volunteer is required." });

    const participationStatus = participationStatuses.has(req.body?.participationStatus || req.body?.participation_status || req.body?.attendanceStatus || req.body?.attendance_status)
      ? req.body.participationStatus || req.body.participation_status || req.body.attendanceStatus || req.body.attendance_status
      : "registered";
    const attendanceStatus = participationStatus === "cancelled" ? "absent" : participationStatus === "registered" ? "registered" : "attended";

    await pool.query(
      `
          INSERT INTO event_participants
          (event_id, volunteer_id, role, attendance_status, participation_status, completed_at, added_by)
        VALUES (?, ?, ?, ?, ?, IF(? = 'completed', NOW(), NULL), ?)
        ON DUPLICATE KEY UPDATE
          role = VALUES(role),
          attendance_status = VALUES(attendance_status),
          participation_status = VALUES(participation_status),
          completed_at = IF(VALUES(participation_status) = 'completed', COALESCE(completed_at, NOW()), completed_at)
      `,
      [
        req.params.id,
        volunteerId,
        cleanString(req.body?.role, 140) || "Volunteer",
        attendanceStatus,
        participationStatus,
        participationStatus,
        req.user.id,
      ],
    );

    await logEventAudit(req, "participation", req.params.id, { volunteerId, participationStatus });
    res.status(201).json({ success: true });
  }),
);

router.patch(
  "/:id/participants/:participantId",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const participationStatus = participationStatuses.has(req.body?.participationStatus || req.body?.participation_status || req.body?.attendanceStatus || req.body?.attendance_status)
      ? req.body.participationStatus || req.body.participation_status || req.body.attendanceStatus || req.body.attendance_status
      : "registered";
    const attendanceStatus = participationStatus === "cancelled" ? "absent" : participationStatus === "registered" ? "registered" : "attended";

    const [result] = await pool.query(
      `
        UPDATE event_participants
        SET attendance_status = ?,
            participation_status = ?,
            completed_at = IF(? = 'completed', COALESCE(completed_at, NOW()), completed_at)
        WHERE id = ? AND event_id = ?
      `,
      [attendanceStatus, participationStatus, participationStatus, req.params.participantId, req.params.id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Participant not found." });

    await logEventAudit(req, "participation", req.params.id, { participantId: req.params.participantId, participationStatus });
    res.json({ success: true });
  }),
);

router.delete(
  "/:id/participants/:participantId",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    await pool.query("DELETE FROM event_participants WHERE id = ? AND event_id = ?", [
      req.params.participantId,
      req.params.id,
    ]);
    await logEventAudit(req, "attendance", req.params.id, { participantId: req.params.participantId, removed: true });
    res.json({ success: true });
  }),
);

router.get(
  "/:id/certificates",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const event = await loadEvent(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    const search = cleanString(req.query.search, 180);
    const membershipStatus = cleanString(req.query.membershipStatus || req.query.membership_status, 40);
    const certificateStatus = cleanString(req.query.certificateStatus || req.query.certificate_status, 40);
    const claimed = cleanString(req.query.claimed, 20);
    const filters = [];
    const values = [req.params.id];

    if (search) {
      filters.push("(v.full_name LIKE ? OR v.email LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like);
    }
    if (membershipStatus && membershipStatus !== "all") {
      filters.push("v.membership_status = ?");
      values.push(membershipStatus);
    }
    if (certificateStatus && certificateStatus !== "all") {
      if (certificateStatus === "none") {
        filters.push("ec.id IS NULL");
      } else {
        filters.push("ec.status = ?");
        values.push(certificateStatus);
      }
    }
    if (claimed === "claimed") filters.push("ec.claimed_at IS NOT NULL");
    if (claimed === "unclaimed") filters.push("ec.id IS NOT NULL AND ec.claimed_at IS NULL");

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT
          v.id AS volunteer_id,
          v.full_name,
          v.email,
          v.membership_status,
          ec.id AS certificate_id,
          ec.certificate_type,
          ec.status AS certificate_status,
          ec.verification_code,
          ec.issued_at,
          ec.claimed_at
        FROM volunteers v
        LEFT JOIN event_certificates ec
          ON ec.volunteer_id = v.id
         AND ec.event_id = ?
         AND ec.certificate_type = 'event'
        ${where}
        ORDER BY v.full_name ASC
      `,
      values,
    );

    res.json({ success: true, data: { event: mapEvent(event), recipients: rows.map(mapCertificateRecipient) } });
  }),
);

router.post(
  "/:id/certificates",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const event = await loadEvent(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });

    const volunteerIds = Array.isArray(req.body?.volunteerIds) ? req.body.volunteerIds.map(Number).filter(Boolean) : [];
    if (volunteerIds.length === 0) return res.status(400).json({ success: false, message: "Select at least one volunteer." });

    for (const volunteerId of volunteerIds) {
      await pool.query(
        `
          INSERT INTO event_certificates
            (event_id, volunteer_id, certificate_type, status, verification_code, issued_by, issued_at)
          VALUES (?, ?, 'event', 'eligible', ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            status = 'eligible',
            issued_by = VALUES(issued_by),
            issued_at = COALESCE(issued_at, NOW()),
            claimed_at = NULL
        `,
        [req.params.id, volunteerId, newCertificateCode(), req.user.id],
      );
      await createNotification({
        recipientType: "volunteer",
        recipientId: volunteerId,
        title: "Certificate issued",
        message: `${event.title} certificate is eligible to claim.`,
        notificationType: "certificate",
        actionUrl: "/volunteer/certificates",
      });
      const volunteer = await loadVolunteer(volunteerId);
      if (volunteer?.email) {
        await sendTemplateEmail({
          emailType: "certificate_issued",
          to: volunteer.email,
          recipientType: "volunteer",
          recipientId: volunteer.id,
          variables: {
            full_name: volunteer.full_name,
            event_name: event.title,
            certificate_name: "Event Certificate",
            membership_status: volunteer.membership_status,
          },
          metadata: { eventId: event.id },
        });
      }
    }

    await logEventAudit(req, "certificate_issue", req.params.id, { volunteerIds });
    res.status(201).json({ success: true, message: "Certificates issued as eligible." });
  }),
);

router.patch(
  "/:id/certificates/revoke",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const volunteerIds = Array.isArray(req.body?.volunteerIds) ? req.body.volunteerIds.map(Number).filter(Boolean) : [];
    if (volunteerIds.length === 0) return res.status(400).json({ success: false, message: "Select at least one volunteer." });
    const event = await loadEvent(req.params.id);

    await pool.query(
      `
        UPDATE event_certificates
        SET status = 'revoked'
        WHERE event_id = ?
          AND certificate_type = 'event'
          AND volunteer_id IN (${volunteerIds.map(() => "?").join(",")})
      `,
      [req.params.id, ...volunteerIds],
    );
    await Promise.all(
      volunteerIds.map(async (volunteerId) => {
        await createNotification({
          recipientType: "volunteer",
          recipientId: volunteerId,
          title: "Certificate revoked",
          message: "An event certificate has been revoked by Maai.",
          notificationType: "certificate",
          actionUrl: "/volunteer/certificates",
        });
        const volunteer = await loadVolunteer(volunteerId);
        if (volunteer?.email) {
          await sendTemplateEmail({
            emailType: "certificate_revoked",
            to: volunteer.email,
            recipientType: "volunteer",
            recipientId: volunteer.id,
            variables: {
              full_name: volunteer.full_name,
              event_name: event?.title || "Maai event",
              certificate_name: "Event Certificate",
              membership_status: volunteer.membership_status,
            },
            metadata: { eventId: req.params.id },
          });
        }
      }),
    );
    await logEventAudit(req, "certificate_revoke", req.params.id, { volunteerIds });
    res.json({ success: true });
  }),
);

router.patch(
  "/:id/certificates/:certificateId/revoke",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const event = await loadEvent(req.params.id);
    const [certificates] = await pool.query("SELECT volunteer_id FROM event_certificates WHERE id = ? AND event_id = ? LIMIT 1", [
      req.params.certificateId,
      req.params.id,
    ]);
    const [result] = await pool.query(
      `
        UPDATE event_certificates
        SET status = 'revoked'
        WHERE id = ? AND event_id = ?
      `,
      [req.params.certificateId, req.params.id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Certificate not found." });
    if (certificates[0]?.volunteer_id) {
      await createNotification({
        recipientType: "volunteer",
        recipientId: certificates[0].volunteer_id,
        title: "Certificate revoked",
        message: "An event certificate has been revoked by Maai.",
        notificationType: "certificate",
        actionUrl: "/volunteer/certificates",
      });
      const volunteer = await loadVolunteer(certificates[0].volunteer_id);
      if (volunteer?.email) {
        await sendTemplateEmail({
          emailType: "certificate_revoked",
          to: volunteer.email,
          recipientType: "volunteer",
          recipientId: volunteer.id,
          variables: {
            full_name: volunteer.full_name,
            event_name: event?.title || "Maai event",
            certificate_name: "Event Certificate",
            membership_status: volunteer.membership_status,
          },
          metadata: { eventId: req.params.id, certificateId: req.params.certificateId },
        });
      }
    }
    await logEventAudit(req, "certificate_revoke", req.params.id, { certificateId: req.params.certificateId });
    res.json({ success: true });
  }),
);

router.post(
  "/:id/issue-certificates",
  requireAuth,
  manageEvents,
  asyncHandler(async (req, res) => {
    const event = await loadEvent(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Event not found." });
    if (!event.certificate_enabled) return res.status(400).json({ success: false, message: "Certificates are disabled for this event." });

    const volunteerIds = Array.isArray(req.body?.volunteerIds) ? req.body.volunteerIds.map(Number).filter(Boolean) : [];
    if (volunteerIds.length === 0) return res.status(400).json({ success: false, message: "Select at least one volunteer." });

    for (const volunteerId of volunteerIds) {
      await pool.query(
        `
          INSERT INTO event_certificates
            (event_id, volunteer_id, certificate_type, status, verification_code, issued_by, issued_at)
          VALUES (?, ?, 'event', 'eligible', ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            status = 'eligible',
            issued_by = VALUES(issued_by),
            issued_at = COALESCE(issued_at, NOW()),
            claimed_at = NULL
        `,
        [req.params.id, volunteerId, newCertificateCode(), req.user.id],
      );
      await createNotification({
        recipientType: "volunteer",
        recipientId: volunteerId,
        title: "Certificate issued",
        message: `${event.title} certificate is eligible to claim.`,
        notificationType: "certificate",
        actionUrl: "/volunteer/certificates",
      });
      const volunteer = await loadVolunteer(volunteerId);
      if (volunteer?.email) {
        await sendTemplateEmail({
          emailType: "certificate_issued",
          to: volunteer.email,
          recipientType: "volunteer",
          recipientId: volunteer.id,
          variables: {
            full_name: volunteer.full_name,
            event_name: event.title,
            certificate_name: "Event Certificate",
            membership_status: volunteer.membership_status,
          },
          metadata: { eventId: event.id },
        });
      }
    }

    await logEventAudit(req, "certificate_issue", req.params.id, { volunteerIds });
    res.status(201).json({ success: true, message: "Certificates issued as eligible." });
  }),
);

module.exports = router;
