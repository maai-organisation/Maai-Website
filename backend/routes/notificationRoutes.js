const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { requireAuth } = require("../middleware/authMiddleware");
const { pool } = require("../config/db");
const { recipientTypeForRole } = require("../utils/notifications");

const router = express.Router();

function mapNotification(row) {
  return {
    id: row.id,
    recipientType: row.recipient_type,
    recipient_type: row.recipient_type,
    recipientId: row.recipient_id,
    recipient_id: row.recipient_id,
    title: row.title,
    message: row.message,
    notificationType: row.notification_type,
    notification_type: row.notification_type,
    status: row.status,
    actionUrl: row.action_url,
    action_url: row.action_url,
    createdAt: row.created_at,
    created_at: row.created_at,
    readAt: row.read_at,
    read_at: row.read_at,
  };
}

function currentRecipient(req) {
  return {
    recipientType: recipientTypeForRole(req.user.role),
    recipientId: req.user.id,
  };
}

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { recipientType, recipientId } = currentRecipient(req);
    const [rows] = await pool.query(
      `
        SELECT *
        FROM notifications
        WHERE recipient_type = ?
          AND recipient_id = ?
          AND status <> 'archived'
        ORDER BY created_at DESC
        LIMIT 50
      `,
      [recipientType, recipientId],
    );
    const [[unread]] = await pool.query(
      `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE recipient_type = ?
          AND recipient_id = ?
          AND status = 'unread'
      `,
      [recipientType, recipientId],
    );

    res.json({ success: true, data: rows.map(mapNotification), meta: { unreadCount: unread.count } });
  }),
);

router.patch(
  "/read-all",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { recipientType, recipientId } = currentRecipient(req);
    await pool.query(
      `
        UPDATE notifications
        SET status = 'read',
            read_at = COALESCE(read_at, NOW())
        WHERE recipient_type = ?
          AND recipient_id = ?
          AND status = 'unread'
      `,
      [recipientType, recipientId],
    );

    res.json({ success: true });
  }),
);

router.patch(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { recipientType, recipientId } = currentRecipient(req);
    const [result] = await pool.query(
      `
        UPDATE notifications
        SET status = 'read',
            read_at = COALESCE(read_at, NOW())
        WHERE id = ?
          AND recipient_type = ?
          AND recipient_id = ?
      `,
      [req.params.id, recipientType, recipientId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    res.json({ success: true });
  }),
);

module.exports = router;
