const path = require('path');
const dotenv = require('dotenv');

const envPath = process.env.ENV_FILE || path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/studyhive',
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  upload: {
    maxFileSizeMb: toNumber(process.env.UPLOAD_MAX_SIZE_MB, 25),
  },
};

module.exports = config;

