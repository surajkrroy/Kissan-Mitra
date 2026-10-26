const path = require('node:path');
const dotenv = require('dotenv');

// Load this project's .env explicitly and let it override stale machine-level
// DB_* variables. This avoids connecting with an old password from PowerShell.
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kissan_mitra_graphql',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

module.exports = pool;