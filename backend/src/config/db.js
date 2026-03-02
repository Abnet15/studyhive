const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: config.db.connectionLimit,
  queueLimit: 0,
  timezone: 'Z',
  dateStrings: false,
});

pool.on('connection', () => {
  if (config.env !== 'test') {
    console.log('[MySQL] Connection established');
  }
});

module.exports = pool;

