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

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;

