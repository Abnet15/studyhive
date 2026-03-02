const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');
const pool = require('../config/db');

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  return null;
};

const attachUser = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, full_name AS fullName, email, role FROM users WHERE id = ? AND is_active = 1 LIMIT 1',
    [userId]
  );
  return rows[0];
};

const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw new ApiError(401, 'Authentication token missing');
  }
  try {
    const decoded = verifyToken(token);
    const user = await attachUser(decoded.sub);
    if (!user) {
      throw new ApiError(401, 'Account no longer exists');
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});

const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Admin role required');
  }
  next();
});

// Optional auth - attaches user if token is present, but doesn't fail if missing
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = getTokenFromRequest(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      const user = await attachUser(decoded.sub);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
    }
  }
  next();
});

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
};

