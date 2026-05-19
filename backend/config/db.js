const mysql = require("mysql2/promise");
require("dotenv").config();

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;

const pool = databaseUrl
  ? mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      ssl: process.env.DB_SSL === "false" ? undefined : { rejectUnauthorized: false },
    })
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "maai_db",
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });

async function testDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log("MySQL database connected successfully");
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testDatabaseConnection,
};
