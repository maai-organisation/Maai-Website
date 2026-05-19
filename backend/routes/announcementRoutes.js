const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { pool } = require("../config/db");

const router = express.Router();

function audienceForUser(user) {
  if (user.role === "ngo") return ["ngos", "all"];
  if (user.role === "superadmin" || user.role === "it_staff") return ["admins", "all"];
  return ["volunteers", "all"];
}

function mapAnnouncement(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    announcementType: row.announcement_type,
    announcement_type: row.announcement_type,
    audience: row.audience,
    priority: row.priority,
    publishAt: row.publish_at,
    publish_at: row.publish_at,
    expireAt: row.expire_at,
    expire_at: row.expire_at,
    status: row.status,
    createdAt: row.created_at,
    created_at: row.created_at,
  };
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const audiences = audienceForUser(req.user);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM announcements
        WHERE status = 'published'
          AND audience IN (?, ?)
          AND (publish_at IS NULL OR publish_at <= NOW())
          AND (expire_at IS NULL OR expire_at > NOW())
        ORDER BY
          FIELD(priority, 'urgent', 'important', 'info'),
          COALESCE(publish_at, created_at) DESC
        LIMIT 10
      `,
      audiences,
    );

    res.json({ success: true, data: rows.map(mapAnnouncement) });
  }),
);

module.exports = router;
