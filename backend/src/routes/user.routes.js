const express = require('express');
const { param, body } = require('express-validator');
const { listUsers, updateUser, deleteUser } = require('../controllers/user.controller');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, requireAdmin, listUsers);

router.patch(
  '/:id',
  [
    param('id').isMongoId(),
    body('role').optional().isIn(['student', 'moderator', 'admin']),
    body('isActive').optional().isBoolean(),
  ],
  validateRequest,
  requireAuth,
  requireAdmin,
  updateUser
);

router.delete(
  '/:id',
  [param('id').isMongoId()],
  validateRequest,
  requireAuth,
  requireAdmin,
  deleteUser
);

module.exports = router;
