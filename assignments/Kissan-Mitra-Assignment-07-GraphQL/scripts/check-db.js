const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true });

async function main() {
  const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing .env setting(s): ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const pool = require('../db');
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT DATABASE() AS databaseName, 1 AS ok');
      console.log(`DATABASE CONNECTED: ${rows[0].databaseName}`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(`Database connection failed (${error.code || 'UNKNOWN'}).`);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Check DB_USER and DB_PASSWORD in this project folder’s .env. Quote DB_PASSWORD if it contains # or whitespace. The password is not printed.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Check that the MySQL service is running and DB_HOST/DB_PORT match its configuration.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Run schema.sql to create the database and products table.');
    } else {
      console.error(error.message);
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
