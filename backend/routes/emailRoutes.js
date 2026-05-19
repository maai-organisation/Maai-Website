const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { pool } = require("../config/db");
const { sendEmail, sendTemplateEmail } = require("../utils/emailService");

const router = express.Router();
const manageEmail = authorizeRoles("superadmin", "it_staff");

function cleanString(value, maxLength = 1000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanLongText(value, maxLength = 10000) {
  return String(value || "").replace(/\r\n/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim().slice(0, maxLength);
}

async function loadAudience(audience) {
  const volunteers =
    audience === "volunteers" || audience === "all"
      ? (await pool.query("SELECT id, full_name, email, membership_status FROM volunteers WHERE role = 'volunteer' AND email IS NOT NULL"))[0]
      : [];
  const ngos =
    audience === "ngos" || audience === "all"
      ? (await pool.query("SELECT id, organization_name, email, membership_status FROM ngos WHERE email IS NOT NULL"))[0]
      : [];
  return { volunteers, ngos };
}

router.post(
  "/send",
  requireAuth,
  manageEmail,
  asyncHandler(async (req, res) => {
    const audience = ["volunteers", "ngos", "all"].includes(req.body?.audience) ? req.body.audience : null;
    const recipientEmail = cleanString(req.body?.recipientEmail || req.body?.recipient_email || req.body?.to, 180).toLowerCase();
    const emailType = cleanString(req.body?.emailType || req.body?.email_type || "announcement", 80);
    const subject = cleanString(req.body?.subject, 255);
    const body = cleanLongText(req.body?.body, 10000);
    const useTemplate = req.body?.useTemplate ?? req.body?.use_template ?? true;

    if (!audience && !recipientEmail) {
      return res.status(400).json({ success: false, message: "Choose an audience or recipient email." });
    }
    if (!useTemplate && (!subject || !body)) {
      return res.status(400).json({ success: false, message: "Subject and body are required for direct emails." });
    }

    const results = [];
    if (audience) {
      const { volunteers, ngos } = await loadAudience(audience);
      for (const volunteer of volunteers) {
        results.push(
          await sendTemplateEmail({
            emailType,
            to: volunteer.email,
            variables: {
              full_name: volunteer.full_name,
              event_name: subject || "Maai announcement",
              certificate_name: "",
              membership_status: volunteer.membership_status,
              camp_name: "",
              ngo_name: "",
              verification_code: "",
            },
          }),
        );
      }
      for (const ngo of ngos) {
        results.push(
          await sendTemplateEmail({
            emailType,
            to: ngo.email,
            variables: {
              full_name: ngo.organization_name,
              event_name: subject || "Maai announcement",
              certificate_name: "",
              membership_status: ngo.membership_status,
              camp_name: "",
              ngo_name: ngo.organization_name,
              verification_code: "",
            },
          }),
        );
      }
    } else if (useTemplate) {
      results.push(await sendTemplateEmail({ emailType, to: recipientEmail, variables: req.body?.variables || {} }));
    } else {
      results.push(await sendEmail({ to: recipientEmail, subject, body, emailType }));
    }

    res.json({
      success: true,
      data: {
        total: results.length,
        sent: results.filter((item) => item.status === "sent").length,
        failed: results.filter((item) => item.status === "failed").length,
        queued: results.filter((item) => item.status === "queued").length,
      },
    });
  }),
);

router.get(
  "/logs",
  requireAuth,
  manageEmail,
  asyncHandler(async (req, res) => {
    const status = cleanString(req.query.status, 40);
    const emailType = cleanString(req.query.emailType || req.query.email_type, 80);
    const filters = [];
    const values = [];

    if (status && status !== "all") {
      filters.push("status = ?");
      values.push(status);
    }
    if (emailType && emailType !== "all") {
      filters.push("email_type = ?");
      values.push(emailType);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `
        SELECT id, recipient_email, email_type, subject, status, sent_at, error_message, created_at
        FROM email_logs
        ${where}
        ORDER BY created_at DESC
        LIMIT 100
      `,
      values,
    );
    res.json({ success: true, data: rows });
  }),
);

module.exports = router;
