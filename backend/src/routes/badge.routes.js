const express = require('express');
const { body } = require('express-validator');
const { listBadges, awardBadge } = require('../controllers/badge.controller');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', listBadges);

router.post(
  '/award',
  [body('badgeId').isMongoId(), body('userId').isMongoId()],
  validateRequest,
  requireAuth,
  requireAdmin,
  awardBadge
);

module.exports = router;

