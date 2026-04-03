const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/studyhive';
    await mongoose.connect(mongoUri);
    if (config.env !== 'test') {
      console.log(`[MongoDB] Connected to ${mongoose.connection.host}`);
    }
  } catch (err) {
    console.error(`[MongoDB] FAILED TO CONNECT: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
