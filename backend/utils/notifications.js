const { pool } = require("../config/db");

const roleRecipientTypes = {
  volunteer: "volunteer",
  ngo: "ngo",
  it_staff: "it_staff",
  superadmin: "superadmin",
};

function recipientTypeForRole(role) {
  return roleRecipientTypes[role] || "volunteer";
}

async function createNotification({
  recipientType,
  recipientId,
  title,
  message,
  notificationType = "system",
  actionUrl = null,
}) {
  if (!recipientType || !recipientId || !title || !message) return null;

  const [result] = await pool.query(
    `
      INSERT INTO notifications
        (recipient_type, recipient_id, title, message, notification_type, action_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [recipientType, recipientId, title, message, notificationType, actionUrl],
  );

  return result.insertId;
}

async function createRoleNotifications(role, payload) {
  const [rows] = await pool.query("SELECT id FROM volunteers WHERE role = ?", [role]);
  await Promise.all(
    rows.map((row) =>
      createNotification({
        ...payload,
        recipientType: recipientTypeForRole(role),
        recipientId: row.id,
      }),
    ),
  );
}

async function createAdminNotifications(payload) {
  await Promise.all([createRoleNotifications("superadmin", payload), createRoleNotifications("it_staff", payload)]);
}

async function createVolunteerNotifications(whereClause, values, payload) {
  const [rows] = await pool.query(`SELECT id FROM volunteers ${whereClause || ""}`, values || []);
  await Promise.all(
    rows.map((row) =>
      createNotification({
        ...payload,
        recipientType: "volunteer",
        recipientId: row.id,
      }),
    ),
  );
}

module.exports = {
  createAdminNotifications,
  createNotification,
  createRoleNotifications,
  createVolunteerNotifications,
  recipientTypeForRole,
};
