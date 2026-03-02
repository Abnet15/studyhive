const express = require('express');
const { summary } = require('../controllers/dashboard.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', requireAuth, requireAdmin, summary);

module.exports = router;

