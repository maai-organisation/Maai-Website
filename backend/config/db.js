require("dotenv").config();
const mysql = require("mysql2/promise");

const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required database environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // ← required for Aiven
});

if (typeof pool.on === "function") {
  pool.on("connection", (connection) => {
    console.log("[DB_POOL] connection created");

    if (typeof connection.on === "function") {
      connection.on("error", (error) => {
        console.error("[DB_POOL_CONNECTION_ERROR]", error.message);
      });
    }
  });

  pool.on("enqueue", () => {
    console.log("[DB_POOL] waiting for available connection");
  });
}

async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log("MySQL database connected successfully");
  } finally {
    connection.release();
  }
}

module.exports = { pool, testDatabaseConnection };
