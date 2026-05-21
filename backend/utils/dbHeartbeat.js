function startDbHeartbeat(pool) {
  const intervalMs = 300000;

  return setInterval(async () => {
    try {
      await pool.query("SELECT 1");
      console.log("[DB_HEARTBEAT]", new Date().toISOString(), "Aiven connection OK");
    } catch (err) {
      console.error("[DB_HEARTBEAT_ERROR]", err.message);
    }
  }, intervalMs);
}

module.exports = {
  startDbHeartbeat,
};
