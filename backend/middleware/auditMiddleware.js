const { pool } = require("../config/db");

function inferEntityType(path) {
  const [entityType] = String(path || "")
    .split("/")
    .filter(Boolean);
  return entityType || "admin";
}

function auditAdminAction(req, res, next) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }

  res.on("finish", async () => {
    if (res.statusCode >= 400 || !req.user?.id) return;

    try {
      await pool.query(
        `
          INSERT INTO audit_logs
            (actor_id, action, entity_type, entity_id, metadata_json)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          req.user.id,
          req.method,
          inferEntityType(req.path),
          req.params?.id || req.params?.volunteerId || null,
          JSON.stringify({
            path: req.originalUrl,
            params: req.params || {},
            body: req.body || {},
          }),
        ],
      );
    } catch (error) {
      console.error("Failed to write audit log", error);
    }
  });

  return next();
}

module.exports = {
  auditAdminAction,
};
