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

// Test connection on startup so misconfigured credentials are visible in logs
pool.getConnection()
  .then((conn) => {
    console.log(`[MySQL] Connected to ${config.db.host}:${config.db.port}/${config.db.database}`);
    conn.release();
  })
  .catch((err) => {
    console.error('[MySQL] FAILED TO CONNECT — check DB_* environment variables on Render:');
    console.error(`  host=${config.db.host} port=${config.db.port} user=${config.db.user} database=${config.db.database}`);
    console.error(`  Error: ${err.message}`);
  });

module.exports = pool;

