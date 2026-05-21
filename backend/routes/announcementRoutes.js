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
    eventId: row.event_id,
    event_id: row.event_id,
    isRead: Boolean(row.read_at),
    is_read: Boolean(row.read_at),
    readAt: row.read_at,
    read_at: row.read_at,
    createdAt: row.created_at,
    created_at: row.created_at,
  };
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const audiences = audienceForUser(req.user);
    const readUserId = req.user.role === "ngo" ? 0 : req.user.id;
    const [rows] = await pool.query(
      `
        SELECT a.*, ar.read_at
        FROM announcements a
        LEFT JOIN announcement_reads ar
          ON ar.announcement_id = a.id
         AND ar.user_id = ?
        WHERE a.status = 'published'
          AND (
            a.audience IN (?, ?)
            OR (
              a.audience = 'event_participants'
              AND ? = 'volunteer'
              AND a.event_id IS NOT NULL
              AND EXISTS (
                SELECT 1
                FROM event_participants ep
                WHERE ep.event_id = a.event_id
                  AND ep.volunteer_id = ?
              )
            )
          )
          AND (a.publish_at IS NULL OR a.publish_at <= NOW())
          AND (a.expire_at IS NULL OR a.expire_at > NOW())
        ORDER BY
          FIELD(a.priority, 'urgent', 'important', 'info'),
          COALESCE(a.publish_at, a.created_at) DESC
        LIMIT 10
      `,
      [readUserId, ...audiences, req.user.role, req.user.id],
    );

    res.json({ success: true, data: rows.map(mapAnnouncement) });
  }),
);

router.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role === "ngo") {
      return res.json({ success: true, data: { isRead: true, readAt: new Date().toISOString() } });
    }

    const audiences = audienceForUser(req.user);
    const [rows] = await pool.query(
      `
        SELECT a.id
        FROM announcements a
        WHERE a.id = ?
          AND a.status = 'published'
          AND (
            a.audience IN (?, ?)
            OR (
              a.audience = 'event_participants'
              AND ? = 'volunteer'
              AND a.event_id IS NOT NULL
              AND EXISTS (
                SELECT 1
                FROM event_participants ep
                WHERE ep.event_id = a.event_id
                  AND ep.volunteer_id = ?
              )
            )
          )
          AND (a.publish_at IS NULL OR a.publish_at <= NOW())
          AND (a.expire_at IS NULL OR a.expire_at > NOW())
        LIMIT 1
      `,
      [req.params.id, ...audiences, req.user.role, req.user.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }

    await pool.query(
      `
        INSERT INTO announcement_reads (announcement_id, user_id, read_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE read_at = COALESCE(read_at, VALUES(read_at))
      `,
      [req.params.id, req.user.id],
    );

    const [[read]] = await pool.query(
      "SELECT read_at FROM announcement_reads WHERE announcement_id = ? AND user_id = ? LIMIT 1",
      [req.params.id, req.user.id],
    );

    res.json({ success: true, data: { isRead: true, readAt: read?.read_at || null } });
  }),
);

module.exports = router;
