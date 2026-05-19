const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { pool } = require("../config/db");
const { createSimplePdf, ensureVolunteerId, mapVolunteerId } = require("../utils/idCards");

const router = express.Router();

async function loadVolunteerId(req) {
  if (req.user.role === "volunteer" && (req.user.membership_status || req.user.membershipStatus) === "verified") {
    await ensureVolunteerId(req.user.id);
  }

  const [rows] = await pool.query(
    `
      SELECT
        vi.*,
        v.full_name,
        v.email,
        v.role,
        v.membership_status,
        t.name AS template_name,
        t.template_type,
        t.front_background_url,
        t.back_background_url,
        t.logo_url,
        t.header_text,
        t.footer_text,
        t.is_default
      FROM volunteer_ids vi
      INNER JOIN volunteers v ON v.id = vi.volunteer_id
      INNER JOIN id_card_templates t ON t.id = vi.template_id
      WHERE vi.volunteer_id = ?
        AND vi.status = 'active'
      ORDER BY vi.issued_at DESC
      LIMIT 1
    `,
    [req.user.id],
  );

  return rows[0];
}

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!["volunteer", "it_staff", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Volunteer account required." });
    }

    const card = await loadVolunteerId(req);
    if (!card) return res.json({ success: true, data: null });
    res.json({ success: true, data: mapVolunteerId(card) });
  }),
);

async function sendIdPdf(req, res, disposition) {
  const card = await loadVolunteerId(req);
  if (!card) return res.status(404).json({ success: false, message: "ID card not found." });

  const pdf = createSimplePdf("Volunteer ID Card", [
    card.header_text || "Maai Membership Card",
    `Name: ${card.full_name}`,
    `Membership Number: ${card.membership_number}`,
    `Role: ${card.role}`,
    `Membership Status: ${card.membership_status}`,
    `Verification Code: ${card.verification_code}`,
    "",
    "Back",
    "QR placeholder: reserved for future verification.",
    card.footer_text || "This card remains the property of Maai organisation.",
  ]);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="maai-id-card-${card.id}.pdf"`);
  return res.send(pdf);
}

router.get(
  "/me/preview",
  requireAuth,
  asyncHandler(async (req, res) => sendIdPdf(req, res, "inline")),
);

router.get(
  "/me/download",
  requireAuth,
  asyncHandler(async (req, res) => sendIdPdf(req, res, "attachment")),
);

module.exports = router;
