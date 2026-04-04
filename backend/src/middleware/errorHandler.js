const ApiError = require('../utils/ApiError');

const errorHandler = (err, _req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details,
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
  
  if (err.message && err.message.includes('File size too large')) {
    return res.status(400).json({ status: 'error', message: 'File exceeds the 10MB upload limit. Please upload a smaller file.' });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;

