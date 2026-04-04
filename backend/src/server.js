const http = require('http');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

const server = http.createServer(app);

connectDB().then(() => {
  server.listen(config.port, () => {
    console.log(`StudyHive API listening on port ${config.port} (${config.env})`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${config.port} is already in use.`);
      console.error(`   Run: npx kill-port ${config.port}   (or change PORT in .env)\n`);
      process.exit(1);
    }
    throw err;
  });
});

