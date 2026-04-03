const express = require('express');
const { 
  getRecommendations, 
  generateQuiz, 
  analyzeFile,
  chat
} = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/recommendations', requireAuth, getRecommendations);
router.post('/generate-quiz', requireAuth, generateQuiz);
router.post('/analyze-file', requireAuth, upload.single('file'), analyzeFile);
router.post('/chat', requireAuth, chat);

module.exports = router;
