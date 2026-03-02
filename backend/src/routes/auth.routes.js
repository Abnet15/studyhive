const express = require('express');
const { body } = require('express-validator');
const { register, login, profile, changePassword, updateProfile } = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('departmentId').optional().isInt().withMessage('departmentId must be numeric'),
    body('departmentName').optional().isString().isLength({ min: 2 }).trim(),
    body('academicYear').optional().isInt({ min: 1, max: 6 }),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  login
);

router.get('/me', requireAuth, profile);

router.patch(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validateRequest,
  requireAuth,
  changePassword
);

router.patch(
  '/profile',
  [
    body('fullName').optional().trim().isLength({ min: 2 }),
    body('academicYear').optional().isInt({ min: 1, max: 6 }),
  ],
  validateRequest,
  requireAuth,
  updateProfile
);

module.exports = router;
