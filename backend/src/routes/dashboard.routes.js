const express = require('express');
const { summary, studentSummary } = require('../controllers/dashboard.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', requireAuth, requireAdmin, summary);
router.get('/me', requireAuth, studentSummary);

module.exports = router;

