const express = require('express');
const { 
  getRecommendations, 
  generateQuiz, 
  analyzeFile,
  extractFileText,
  chat,
  generateMasterclass,
  voiceChat,
  getExitExamDiagnostic,
  submitExitExam
} = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/recommendations', requireAuth, getRecommendations);
router.post('/generate-quiz', requireAuth, generateQuiz);
router.post('/analyze-file', requireAuth, upload.single('file'), analyzeFile);
router.post('/extract-text', requireAuth, upload.single('file'), extractFileText);
router.post('/chat', requireAuth, chat);
router.post('/masterclass', requireAuth, generateMasterclass);
router.post('/voice-chat', requireAuth, upload.single('file'), voiceChat);

// ── Public endpoint: no login required — powers the Honey Teacher demo page
router.post('/public-masterclass', generateMasterclass);

router.get('/diagnostic/:department', requireAuth, getExitExamDiagnostic);
router.post('/diagnostic/analyze', requireAuth, submitExitExam);

module.exports = router;
