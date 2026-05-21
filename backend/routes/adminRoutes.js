const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { pool } = require("../config/db");
const { mapNgo, mapVolunteer } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getMembershipSettings } = require("../utils/membershipSettings");
const { ensureVolunteerId } = require("../utils/idCards");
const { createNotification } = require("../utils/notifications");
const { sendEmail } = require("../utils/emailService");

const router = express.Router();

const allowedRoles = new Set(["volunteer", "it_staff", "superadmin"]);
const allowedMembershipStatuses = new Set(["under_review", "verified", "rejected"]);
const allowedNgoStatuses = new Set(["under_review", "verified", "rejected", "suspended"]);
const allowedPaymentStatuses = new Set(["free", "pending", "paid", "failed"]);

function cleanString(value, maxLength = 1000) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanLongText(value, maxLength = 10000) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
}

function mapVolunteerRow(row) {
  const volunteer = mapVolunteer(row);
  return {
    ...volunteer,
    joinedDate: row.created_at,
  };
}

function mapAnnouncement(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message || row.body,
    body: row.message || row.body,
    announcementType: row.announcement_type,
    announcement_type: row.announcement_type,
    audience: row.audience,
    priority: row.priority,
    sendEmail: Boolean(row.send_email),
    send_email: Boolean(row.send_email),
    publishAt: row.publish_at,
    publish_at: row.publish_at,
    expireAt: row.expire_at,
    expire_at: row.expire_at,
    status: row.status,
    eventId: row.event_id,
    event_id: row.event_id,
    unreadCount: Number(row.unread_count || 0),
    unread_count: Number(row.unread_count || 0),
    createdBy: row.created_by,
    created_by: row.created_by,
    createdByName: row.created_by_name,
    created_by_name: row.created_by_name,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };
}

const announcementTypes = new Set(["general", "membership", "event", "camp", "certificate", "system"]);
const announcementAudiences = new Set(["volunteers", "ngos", "all", "admins", "event_participants"]);
const announcementPriorities = new Set(["info", "important", "urgent"]);
const announcementStatuses = new Set(["draft", "published", "archived"]);

function normalizeAnnouncement(input = {}) {
  const title = cleanString(input.title, 220);
  const message = cleanLongText(input.message || input.body, 10000);
  const announcementType = announcementTypes.has(input.announcementType || input.announcement_type)
    ? input.announcementType || input.announcement_type
    : "general";
  const audience = announcementAudiences.has(input.audience) ? input.audience : "all";
  const priority = announcementPriorities.has(input.priority) ? input.priority : "info";
  const status = announcementStatuses.has(input.status) ? input.status : "draft";
  const eventId = Number(input.eventId || input.event_id || 0) || null;
  const publishAt = cleanString(input.publishAt || input.publish_at, 40) || null;
  const expireAt = cleanString(input.expireAt || input.expire_at, 40) || null;
  const errors = {};

  if (!title) errors.title = "Title is required.";
  if (!message) errors.message = "Message is required.";
  if (audience === "event_participants" && !eventId) errors.eventId = "Select an event for participant targeting.";

  return {
    data: {
      title,
      message,
      announcementType,
      audience,
      priority,
      sendEmail: Boolean(input.sendEmail ?? input.send_email),
      eventId,
      publishAt,
      expireAt,
      status,
    },
    errors,
  };
}

function createMembershipCertificateCode(volunteerId) {
  return `MAAI-MEM-${String(volunteerId).padStart(5, "0")}`;
}

async function ensureMembershipCertificateEligibility(volunteerId, actorId) {
  const [existing] = await pool.query(
    "SELECT id FROM event_certificates WHERE volunteer_id = ? AND certificate_type = 'membership' LIMIT 1",
    [volunteerId],
  );

  if (existing.length > 0) {
    await pool.query(
      `
        UPDATE event_certificates
        SET status = IF(status = 'revoked', 'eligible', status),
            issued_by = ?,
            issued_at = COALESCE(issued_at, NOW())
        WHERE id = ?
      `,
      [actorId, existing[0].id],
    );
    return;
  }

  await pool.query(
    `
      INSERT INTO event_certificates
        (event_id, volunteer_id, certificate_type, status, verification_code, issued_by, issued_at)
      VALUES (NULL, ?, 'membership', 'eligible', ?, ?, NOW())
    `,
    [volunteerId, createMembershipCertificateCode(volunteerId), actorId],
  );
}

async function logAudit(actorId, action, entityType, entityId, metadata = {}) {
  await pool.query(
    `
      INSERT INTO audit_logs
        (actor_id, action, entity_type, entity_id, metadata_json)
      VALUES (?, ?, ?, ?, ?)
    `,
    [actorId, action, entityType, entityId || null, JSON.stringify(metadata)],
  );
}

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const [[volunteers]] = await pool.query("SELECT COUNT(*) AS count FROM volunteers");
    const [[pendingVerifications]] = await pool.query(
      "SELECT COUNT(*) AS count FROM volunteers WHERE membership_status = 'under_review'",
    );
    const [[events]] = await pool.query("SELECT COUNT(*) AS count FROM events");
    const [[certificates]] = await pool.query("SELECT COUNT(*) AS count FROM event_certificates");
    const [[campRequests]] = await pool.query("SELECT COUNT(*) AS count FROM camp_requests");
    const [[ngos]] = await pool.query("SELECT COUNT(*) AS count FROM ngos");
    const [activity] = await pool.query(
      `
        SELECT al.*, v.full_name AS actor_name, v.email AS actor_email
        FROM audit_logs al
        LEFT JOIN volunteers v ON v.id = al.actor_id
        ORDER BY al.created_at DESC
        LIMIT 12
      `,
    );

    res.json({
      success: true,
      data: {
        stats: {
          volunteers: volunteers.count,
          ngos: ngos.count,
          pendingApprovals: pendingVerifications.count,
          pendingVerifications: pendingVerifications.count,
          events: events.count,
          certificatesIssued: certificates.count,
          campRequests: campRequests.count,
        },
        activity,
      },
    });
  }),
);

router.get(
  "/analytics",
  asyncHandler(async (req, res) => {
    const [[volunteers]] = await pool.query("SELECT COUNT(*) AS count FROM volunteers");
    const [[verifiedMembers]] = await pool.query(
      "SELECT COUNT(*) AS count FROM volunteers WHERE membership_status = 'verified'",
    );
    const [[pendingMembers]] = await pool.query(
      "SELECT COUNT(*) AS count FROM volunteers WHERE membership_status = 'under_review'",
    );
    const [[ngos]] = await pool.query("SELECT COUNT(*) AS count FROM ngos");
    const [[verifiedNgos]] = await pool.query("SELECT COUNT(*) AS count FROM ngos WHERE membership_status = 'verified'");
    const [[pendingNgos]] = await pool.query(
      "SELECT COUNT(*) AS count FROM ngos WHERE membership_status = 'under_review'",
    );
    const [[events]] = await pool.query("SELECT COUNT(*) AS count FROM events");
    const [[certificates]] = await pool.query("SELECT COUNT(*) AS count FROM event_certificates WHERE status <> 'revoked'");
    const [[campRequests]] = await pool.query("SELECT COUNT(*) AS count FROM camp_requests");
    const [[pendingCampRequests]] = await pool.query(
      "SELECT COUNT(*) AS count FROM camp_requests WHERE status IN ('submitted', 'under_review')",
    );
    const membershipSettings = await getMembershipSettings();

    const [volunteerGrowth] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%b %y') AS label, COUNT(*) AS count
      FROM volunteers
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), label
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);
    const [certificateGrowth] = await pool.query(`
      SELECT DATE_FORMAT(COALESCE(issued_at, created_at), '%b %y') AS label, COUNT(*) AS count
      FROM event_certificates
      WHERE COALESCE(issued_at, created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND status <> 'revoked'
      GROUP BY YEAR(COALESCE(issued_at, created_at)), MONTH(COALESCE(issued_at, created_at)), label
      ORDER BY YEAR(COALESCE(issued_at, created_at)), MONTH(COALESCE(issued_at, created_at))
    `);
    const [eventsByMonth] = await pool.query(`
      SELECT DATE_FORMAT(COALESCE(start_datetime, created_at), '%b %y') AS label, COUNT(*) AS count
      FROM events
      WHERE COALESCE(start_datetime, created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(COALESCE(start_datetime, created_at)), MONTH(COALESCE(start_datetime, created_at)), label
      ORDER BY YEAR(COALESCE(start_datetime, created_at)), MONTH(COALESCE(start_datetime, created_at))
    `);
    const [campRequestSeries] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%b %y') AS label, COUNT(*) AS count
      FROM camp_requests
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at), label
      ORDER BY YEAR(created_at), MONTH(created_at)
    `);
    const [membershipBreakdown] = await pool.query(`
      SELECT membership_status AS status, COUNT(*) AS count
      FROM volunteers
      GROUP BY membership_status
      ORDER BY count DESC
    `);
    const [recentActivity] = await pool.query(
      `
        SELECT al.*, v.full_name AS actor_name, v.email AS actor_email
        FROM audit_logs al
        LEFT JOIN volunteers v ON v.id = al.actor_id
        ORDER BY al.created_at DESC
        LIMIT 10
      `,
    );

    await pool.query(
      `
        INSERT INTO impact_stats
          (id, volunteers_count, ngo_count, events_count, certificates_count)
        VALUES (1, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          volunteers_count = VALUES(volunteers_count),
          ngo_count = VALUES(ngo_count),
          events_count = VALUES(events_count),
          certificates_count = VALUES(certificates_count)
      `,
      [verifiedMembers.count, verifiedNgos.count, events.count, certificates.count],
    );

    res.json({
      success: true,
      data: {
        summary: {
          volunteers: volunteers.count,
          verified_members: verifiedMembers.count,
          verifiedMembers: verifiedMembers.count,
          pending_memberships: pendingMembers.count,
          pendingMemberships: pendingMembers.count,
          ngos: ngos.count,
          verified_ngos: verifiedNgos.count,
          verifiedNgos: verifiedNgos.count,
          pending_ngos: pendingNgos.count,
          pendingNgos: pendingNgos.count,
          events: events.count,
          certificates: certificates.count,
          certificates_issued: certificates.count,
          certificatesIssued: certificates.count,
          camp_requests: campRequests.count,
          campRequests: campRequests.count,
          pending_camp_requests: pendingCampRequests.count,
          pendingCampRequests: pendingCampRequests.count,
          membership_mode: membershipSettings.paymentsEnabled ? "paid" : "free",
          membershipMode: membershipSettings.paymentsEnabled ? "paid" : "free",
          database_status: "online",
          databaseStatus: "online",
        },
        charts: {
          volunteerGrowth,
          certificateGrowth,
          campRequests: campRequestSeries,
          membershipBreakdown,
          eventsByMonth,
        },
        recentActivity,
        systemHealth: {
          databaseStatus: "online",
          pendingActions: pendingMembers.count + pendingNgos.count + pendingCampRequests.count,
          membershipMode: membershipSettings.paymentsEnabled ? "paid" : "free",
        },
      },
    });
  }),
);

router.get(
  "/volunteers",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const membershipStatus = cleanString(req.query.membershipStatus || req.query.membership_status, 40);
    const paymentStatus = cleanString(req.query.paymentStatus || req.query.payment_status, 40);
    const college = cleanString(req.query.college, 180);
    const city = cleanString(req.query.city, 120);
    const filters = [];
    const values = [];

    if (search) {
      filters.push("(full_name LIKE ? OR email LIKE ? OR college LIKE ? OR role LIKE ? OR membership_status LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like, like, like);
    }

    if (membershipStatus && membershipStatus !== "all") {
      filters.push("membership_status = ?");
      values.push(membershipStatus);
    }

    if (paymentStatus && paymentStatus !== "all") {
      filters.push("payment_status = ?");
      values.push(paymentStatus);
    }

    if (college && college !== "all") {
      filters.push("college = ?");
      values.push(college);
    }

    if (city && city !== "all") {
      filters.push("city = ?");
      values.push(city);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT *
        FROM volunteers
        ${where}
        ORDER BY created_at DESC
      `,
      values,
    );

    res.json({ success: true, data: rows.map(mapVolunteerRow) });
  }),
);

router.get(
  "/ngos",
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const membershipStatus = cleanString(req.query.membershipStatus || req.query.membership_status, 40);
    const paymentStatus = cleanString(req.query.paymentStatus || req.query.payment_status, 40);
    const filters = [];
    const values = [];

    if (search) {
      filters.push("(organization_name LIKE ? OR email LIKE ? OR city LIKE ? OR ngo_type LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like, like, like);
    }
    if (membershipStatus && membershipStatus !== "all") {
      filters.push("membership_status = ?");
      values.push(membershipStatus);
    }
    if (paymentStatus && paymentStatus !== "all") {
      filters.push("payment_status = ?");
      values.push(paymentStatus);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(`SELECT * FROM ngos ${where} ORDER BY created_at DESC`, values);
    res.json({ success: true, data: rows.map((row) => ({ ...mapNgo(row), joinedDate: row.created_at })) });
  }),
);

router.patch(
  "/ngos/:id/status",
  asyncHandler(async (req, res) => {
    const membershipStatus = cleanString(req.body?.membershipStatus || req.body?.membership_status || req.body?.status, 40);
    if (!allowedNgoStatuses.has(membershipStatus)) {
      return res.status(400).json({ success: false, message: "Invalid NGO status." });
    }

    const [result] = await pool.query(
      `
        UPDATE ngos
        SET membership_status = ?,
            verified_by = IF(? = 'verified', ?, NULL),
            verified_at = IF(? = 'verified', NOW(), NULL)
        WHERE id = ?
      `,
      [membershipStatus, membershipStatus, req.user.id, membershipStatus, req.params.id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "NGO not found." });

    await logAudit(req.user.id, `ngo.${membershipStatus}`, "ngo", req.params.id);
    const [rows] = await pool.query("SELECT * FROM ngos WHERE id = ? LIMIT 1", [req.params.id]);
    const ngo = rows[0];
    if (["verified", "rejected", "suspended"].includes(membershipStatus)) {
      await createNotification({
        recipientType: "ngo",
        recipientId: req.params.id,
        title:
          membershipStatus === "verified"
            ? "NGO verified"
            : membershipStatus === "rejected"
              ? "NGO registration rejected"
              : "NGO access suspended",
        message:
          membershipStatus === "verified"
            ? "Your NGO profile has been verified by Maai."
            : membershipStatus === "rejected"
              ? "Your NGO profile was not approved at this time."
              : "Your NGO dashboard access has been suspended.",
        notificationType: "ngo",
        actionUrl: "/ngo/dashboard",
      });
    }
    if (membershipStatus === "verified" && ngo?.email) {
      await sendTemplateEmail({
        emailType: "ngo_verified",
        to: ngo.email,
        recipientType: "ngo",
        recipientId: ngo.id,
        variables: {
          full_name: ngo.organization_name,
          membership_status: ngo.membership_status,
          event_name: "Maai NGO verification",
          certificate_name: "",
        },
        metadata: { actorId: req.user.id },
      });
    }
    res.json({ success: true, data: mapNgo(ngo) });
  }),
);

router.patch(
  "/volunteers/:id/status",
  asyncHandler(async (req, res) => {
    const membershipStatus = cleanString(req.body?.membershipStatus || req.body?.membership_status || req.body?.status, 40);
    if (!allowedMembershipStatuses.has(membershipStatus)) {
      return res.status(400).json({ success: false, message: "Invalid membership status." });
    }

    const [result] = await pool.query(
      `
        UPDATE volunteers
        SET membership_status = ?,
            verified_by = IF(? = 'verified', ?, NULL),
            verified_at = IF(? = 'verified', NOW(), NULL)
        WHERE id = ?
      `,
      [membershipStatus, membershipStatus, req.user.id, membershipStatus, req.params.id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Volunteer not found." });
    }

    if (membershipStatus === "verified") {
      await ensureMembershipCertificateEligibility(req.params.id, req.user.id);
      await ensureVolunteerId(req.params.id, req.user.id);
      await createNotification({
        recipientType: "volunteer",
        recipientId: req.params.id,
        title: "Membership verified",
        message: "Your Maai membership has been verified. Your membership certificate is now eligible to claim.",
        notificationType: "membership",
        actionUrl: "/volunteer/certificates",
      });
    } else if (membershipStatus === "rejected") {
      await createNotification({
        recipientType: "volunteer",
        recipientId: req.params.id,
        title: "Membership update",
        message: "Your Maai membership request was not approved at this time.",
        notificationType: "membership",
        actionUrl: "/volunteer/dashboard",
      });
    }

    await logAudit(req.user.id, `volunteer.membership.${membershipStatus}`, "volunteer", req.params.id);
    const [rows] = await pool.query("SELECT * FROM volunteers WHERE id = ? LIMIT 1", [req.params.id]);
    const volunteer = rows[0];
    if ((membershipStatus === "verified" || membershipStatus === "rejected") && volunteer?.email) {
      await sendTemplateEmail({
        emailType: membershipStatus === "verified" ? "membership_verified" : "membership_rejected",
        to: volunteer.email,
        recipientType: "volunteer",
        recipientId: volunteer.id,
        variables: {
          full_name: volunteer.full_name,
          membership_status: volunteer.membership_status,
          event_name: "Maai Membership",
          certificate_name: "Membership Certificate",
        },
        metadata: { actorId: req.user.id },
      });
    }
    return res.json({ success: true, data: mapVolunteerRow(volunteer) });
  }),
);

router.patch(
  "/volunteers/:id/payment-status",
  asyncHandler(async (req, res) => {
    const paymentStatus = cleanString(req.body?.paymentStatus || req.body?.payment_status || req.body?.status, 40);
    if (!allowedPaymentStatuses.has(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status." });
    }

    const [result] = await pool.query("UPDATE volunteers SET payment_status = ? WHERE id = ?", [paymentStatus, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Volunteer not found." });
    }

    await logAudit(req.user.id, `volunteer.payment.${paymentStatus}`, "volunteer", req.params.id);
    const [rows] = await pool.query("SELECT * FROM volunteers WHERE id = ? LIMIT 1", [req.params.id]);
    return res.json({ success: true, data: mapVolunteerRow(rows[0]) });
  }),
);

router.patch(
  "/volunteers/:id/role",
  authorizeRoles("superadmin"),
  asyncHandler(async (req, res) => {
    const role = cleanString(req.body?.role, 40);
    const volunteerId = Number(req.params.id);

    if (!allowedRoles.has(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    if (volunteerId === Number(req.user.id) && role !== "superadmin") {
      return res.status(400).json({ success: false, message: "You cannot demote yourself." });
    }

    const [result] = await pool.query("UPDATE volunteers SET role = ? WHERE id = ?", [role, volunteerId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Volunteer not found." });
    }

    await logAudit(req.user.id, "volunteer.role.change", "volunteer", volunteerId, { role });
    const [rows] = await pool.query("SELECT * FROM volunteers WHERE id = ? LIMIT 1", [volunteerId]);
    return res.json({ success: true, data: mapVolunteerRow(rows[0]) });
  }),
);

router.patch(
  "/volunteers/:id/id-card/revoke",
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("UPDATE volunteer_ids SET status = 'revoked' WHERE volunteer_id = ? AND status = 'active'", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Active volunteer ID not found." });
    }

    await logAudit(req.user.id, "id_cards.revoke", "volunteer_id", req.params.id);
    res.json({ success: true });
  }),
);

router.get(
  "/audit-logs",
  authorizeRoles("superadmin"),
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      `
        SELECT al.*, v.full_name AS actor_name, v.email AS actor_email
        FROM audit_logs al
        LEFT JOIN volunteers v ON v.id = al.actor_id
        ORDER BY al.created_at DESC
        LIMIT 100
      `,
    );

    res.json({ success: true, data: rows });
  }),
);

router.get(
  "/membership-settings",
  authorizeRoles("superadmin"),
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: await getMembershipSettings() });
  }),
);

router.patch(
  "/membership-settings",
  authorizeRoles("superadmin"),
  asyncHandler(async (req, res) => {
    const paymentsEnabled = req.body?.paymentsEnabled ?? req.body?.payments_enabled;
    const membershipFee = Number(req.body?.membershipFee ?? req.body?.membership_fee ?? 0);
    const currency = cleanString(req.body?.currency || "INR", 10).toUpperCase();
    const upiQrUrl = cleanString(req.body?.upiQrUrl || req.body?.upi_qr_url, 2000);
    const instructions = cleanString(req.body?.paymentInstructions || req.body?.payment_instructions || req.body?.instructions, 5000);
    const membershipName = cleanString(req.body?.membershipName || req.body?.membership_name, 180) || (paymentsEnabled ? "Maai Membership" : "Free Membership");
    const isActive = req.body?.isActive ?? req.body?.is_active ?? true;

    await pool.query(
      `
        UPDATE membership_settings
        SET payments_enabled = ?,
            membership_fee = ?,
            currency = ?,
            upi_qr_url = ?,
            payment_instructions = ?,
            instructions = ?,
            membership_name = ?,
            is_active = ?
        WHERE id = 1
      `,
      [
        paymentsEnabled ? 1 : 0,
        Number.isFinite(membershipFee) ? membershipFee : 0,
        currency || "INR",
        upiQrUrl || null,
        instructions || null,
        instructions || null,
        membershipName,
        isActive ? 1 : 0,
      ],
    );

    await logAudit(req.user.id, "membership.settings.update", "membership_settings", 1);
    res.json({ success: true, data: await getMembershipSettings() });
  }),
);

router.get(
  "/announcements",
  authorizeRoles("superadmin", "it_staff"),
  asyncHandler(async (req, res) => {
    const search = cleanString(req.query.search, 180);
    const audience = cleanString(req.query.audience, 40);
    const status = cleanString(req.query.status, 40);
    const filters = [];
    const values = [];

    if (audience && audience !== "any") {
      filters.push("a.audience = ?");
      values.push(audience);
    }
    if (status && status !== "all") {
      filters.push("a.status = ?");
      values.push(status);
    }
    if (search) {
      filters.push("(a.title LIKE ? OR a.message LIKE ?)");
      const like = `%${search}%`;
      values.push(like, like);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT
          a.*,
          v.full_name AS created_by_name,
          (
            SELECT COUNT(*)
            FROM notifications n
            WHERE n.notification_type = 'announcement'
              AND n.title = a.title
              AND n.status = 'unread'
          ) AS unread_count
        FROM announcements a
        LEFT JOIN volunteers v ON v.id = a.created_by
        ${where}
        ORDER BY a.created_at DESC
        LIMIT 100
      `,
      values,
    );

    res.json({ success: true, data: rows.map(mapAnnouncement) });
  }),
);

async function loadAnnouncement(id) {
  const [rows] = await pool.query("SELECT * FROM announcements WHERE id = ? LIMIT 1", [id]);
  return rows[0];
}

function shouldPublishNow(announcement) {
  if (!announcement || announcement.status !== "published") return false;
  if (!announcement.publish_at) return true;
  return new Date(announcement.publish_at).getTime() <= Date.now();
}

async function loadAnnouncementRecipients(audience) {
  const volunteers =
    audience === "volunteers" || audience === "all"
      ? (await pool.query("SELECT id, full_name, email, membership_status FROM volunteers WHERE role = 'volunteer'"))[0]
      : [];
  const ngos =
    audience === "ngos" || audience === "all"
      ? (await pool.query("SELECT id, organization_name, email, membership_status FROM ngos"))[0]
      : [];
  const admins =
    audience === "admins" || audience === "all"
      ? (await pool.query("SELECT id, full_name, email, role FROM volunteers WHERE role IN ('superadmin', 'it_staff')"))[0]
      : [];
  return { volunteers, ngos, admins };
}

async function loadEventParticipantRecipients(eventId) {
  if (!eventId) return { volunteers: [], ngos: [], admins: [] };
  const [volunteers] = await pool.query(
    `
      SELECT DISTINCT v.id, v.full_name, v.email, v.membership_status
      FROM event_participants ep
      INNER JOIN volunteers v ON v.id = ep.volunteer_id
      WHERE ep.event_id = ?
        AND v.role = 'volunteer'
    `,
    [eventId],
  );
  return { volunteers, ngos: [], admins: [] };
}

async function publishAnnouncement(announcement, actorId) {
  if (!shouldPublishNow(announcement)) return { notificationsCreated: 0, emailsQueued: 0 };
  const recipients =
    announcement.audience === "event_participants"
      ? await loadEventParticipantRecipients(announcement.event_id)
      : await loadAnnouncementRecipients(announcement.audience);
  let notificationsCreated = 0;
  let emailsQueued = 0;

  for (const volunteer of recipients.volunteers) {
    await createNotification({
      recipientType: "volunteer",
      recipientId: volunteer.id,
      title: announcement.title,
      message: announcement.message,
      notificationType: "announcement",
      actionUrl: "/volunteer/dashboard",
    });
    notificationsCreated += 1;
    if (announcement.send_email && volunteer.email) {
      await sendEmail({
        to: volunteer.email,
        subject: announcement.title,
        body: announcement.message,
        emailType: "announcement",
      });
      emailsQueued += 1;
    }
  }

  for (const ngo of recipients.ngos) {
    await createNotification({
      recipientType: "ngo",
      recipientId: ngo.id,
      title: announcement.title,
      message: announcement.message,
      notificationType: "announcement",
      actionUrl: "/ngo/dashboard",
    });
    await pool.query("INSERT INTO ngo_notifications (ngo_id, title, message, notification_type) VALUES (?, ?, ?, 'announcement')", [
      ngo.id,
      announcement.title,
      announcement.message,
    ]);
    notificationsCreated += 1;
    if (announcement.send_email && ngo.email) {
      await sendEmail({
        to: ngo.email,
        subject: announcement.title,
        body: announcement.message,
        emailType: "announcement",
      });
      emailsQueued += 1;
    }
  }

  for (const admin of recipients.admins) {
    await createNotification({
      recipientType: admin.role,
      recipientId: admin.id,
      title: announcement.title,
      message: announcement.message,
      notificationType: "announcement",
      actionUrl: "/admin",
    });
    notificationsCreated += 1;
    if (announcement.send_email && admin.email) {
      await sendEmail({
        to: admin.email,
        subject: announcement.title,
        body: announcement.message,
        emailType: "announcement",
      });
      emailsQueued += 1;
    }
  }

  if (announcement.send_email) {
    await logAudit(actorId, "announcement.email_send", "announcement", announcement.id, { emailsQueued });
  }
  return { notificationsCreated, emailsQueued };
}

let scheduledAnnouncementRunActive = false;

async function processScheduledAnnouncements() {
  if (scheduledAnnouncementRunActive) return;
  scheduledAnnouncementRunActive = true;
  try {
    const [rows] = await pool.query(
      `
        SELECT *
        FROM announcements
        WHERE status = 'draft'
          AND publish_at IS NOT NULL
          AND publish_at <= NOW()
        ORDER BY publish_at ASC
        LIMIT 25
      `,
    );

    for (const announcement of rows) {
      const [result] = await pool.query(
        "UPDATE announcements SET status = 'published' WHERE id = ? AND status = 'draft'",
        [announcement.id],
      );
      if (result.affectedRows === 0) continue;
      const published = await loadAnnouncement(announcement.id);
      const publishMeta = await publishAnnouncement(published, null);
      await logAudit(null, "announcement.scheduled_publish", "announcement", announcement.id, publishMeta);
    }
  } catch (error) {
    console.warn(`Scheduled announcement publish failed: ${error.message}`);
  } finally {
    scheduledAnnouncementRunActive = false;
  }
}

setTimeout(processScheduledAnnouncements, 10 * 1000).unref?.();
setInterval(processScheduledAnnouncements, 60 * 1000).unref?.();

router.post(
  "/announcements",
  authorizeRoles("superadmin", "it_staff"),
  asyncHandler(async (req, res) => {
    const { data, errors } = normalizeAnnouncement(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    const [result] = await pool.query(
      `
        INSERT INTO announcements
          (title, message, announcement_type, audience, priority, send_email, event_id, publish_at, expire_at, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.title,
        data.message,
        data.announcementType,
        data.audience,
        data.priority,
        data.sendEmail ? 1 : 0,
        data.eventId,
        data.publishAt,
        data.expireAt,
        data.status,
        req.user.id,
      ],
    );
    await logAudit(req.user.id, "announcement.create", "announcement", result.insertId, data);
    const announcement = await loadAnnouncement(result.insertId);
    const publishMeta = await publishAnnouncement(announcement, req.user.id);
    if (publishMeta.notificationsCreated > 0) {
      await logAudit(req.user.id, "announcement.publish", "announcement", result.insertId, publishMeta);
    }

    const [rows] = await pool.query(
      `
        SELECT a.*, v.full_name AS created_by_name
        FROM announcements a
        LEFT JOIN volunteers v ON v.id = a.created_by
        WHERE a.id = ?
      `,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      data: mapAnnouncement(rows[0]),
      meta: publishMeta,
    });
  }),
);

router.put(
  "/announcements/:id",
  authorizeRoles("superadmin", "it_staff"),
  asyncHandler(async (req, res) => {
    const existing = await loadAnnouncement(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Announcement not found." });
    const { data, errors } = normalizeAnnouncement(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: "Please fix the highlighted fields.", errors });
    }

    await pool.query(
      `
        UPDATE announcements
        SET title = ?,
            message = ?,
            announcement_type = ?,
            audience = ?,
            priority = ?,
            send_email = ?,
            event_id = ?,
            publish_at = ?,
            expire_at = ?,
            status = ?
        WHERE id = ?
      `,
      [
        data.title,
        data.message,
        data.announcementType,
        data.audience,
        data.priority,
        data.sendEmail ? 1 : 0,
        data.eventId,
        data.publishAt,
        data.expireAt,
        data.status,
        req.params.id,
      ],
    );
    await logAudit(req.user.id, "announcement.edit", "announcement", req.params.id, data);
    const announcement = await loadAnnouncement(req.params.id);
    let publishMeta = { notificationsCreated: 0, emailsQueued: 0 };
    if (existing.status !== "published" && announcement.status === "published") {
      publishMeta = await publishAnnouncement(announcement, req.user.id);
      await logAudit(req.user.id, "announcement.publish", "announcement", req.params.id, publishMeta);
    }
    const [rows] = await pool.query(
      `SELECT a.*, v.full_name AS created_by_name FROM announcements a LEFT JOIN volunteers v ON v.id = a.created_by WHERE a.id = ?`,
      [req.params.id],
    );
    res.json({ success: true, data: mapAnnouncement(rows[0]), meta: publishMeta });
  }),
);

router.patch(
  "/announcements/:id/status",
  authorizeRoles("superadmin", "it_staff"),
  asyncHandler(async (req, res) => {
    const status = cleanString(req.body?.status, 40);
    if (!announcementStatuses.has(status)) return res.status(400).json({ success: false, message: "Invalid announcement status." });
    const existing = await loadAnnouncement(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Announcement not found." });
    await pool.query("UPDATE announcements SET status = ?, publish_at = IF(? = 'published' AND publish_at IS NULL, NOW(), publish_at) WHERE id = ?", [
      status,
      status,
      req.params.id,
    ]);
    const announcement = await loadAnnouncement(req.params.id);
    let publishMeta = { notificationsCreated: 0, emailsQueued: 0 };
    const action = status === "published" ? "publish" : status === "archived" ? "archive" : status;
    if (status === "published" && existing.status !== "published") {
      publishMeta = await publishAnnouncement(announcement, req.user.id);
    }
    await logAudit(req.user.id, `announcement.${action}`, "announcement", req.params.id, publishMeta);
    const [rows] = await pool.query(
      `SELECT a.*, v.full_name AS created_by_name FROM announcements a LEFT JOIN volunteers v ON v.id = a.created_by WHERE a.id = ?`,
      [req.params.id],
    );
    res.json({ success: true, data: mapAnnouncement(rows[0]), meta: publishMeta });
  }),
);

router.delete(
  "/announcements/:id",
  authorizeRoles("superadmin", "it_staff"),
  asyncHandler(async (req, res) => {
    const [result] = await pool.query("UPDATE announcements SET status = 'archived' WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Announcement not found." });
    await logAudit(req.user.id, "announcement.archive", "announcement", req.params.id);
    res.json({ success: true });
  }),
);

module.exports = router;
