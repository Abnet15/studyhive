const http = require('http');
const app = require('./app');
const config = require('./config/env');

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`StudyHive API listening on port ${config.port} (${config.env})`);
});

