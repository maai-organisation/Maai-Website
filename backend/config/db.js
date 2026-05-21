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
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
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

pool.pool = pool;
pool.testDatabaseConnection = testDatabaseConnection;

module.exports = pool;
