const geminiService = require('../services/gemini.service');
const ApiError = require('../utils/ApiError');

exports.getRecommendations = async (req, res, next) => {
  try {
    // Basic user-based recommendations
    const data = await geminiService.getRecommendations({ 
      userEmail: req.user.email,
      academicYear: req.user.academic_year
    });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

exports.generateQuiz = async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic) throw new ApiError(400, 'Topic is required to generate a quiz');

    const data = await geminiService.generateQuiz(topic);
    res.json(data);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

exports.analyzeFile = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'No file uploaded for analysis');
    
    // In a real app, read the file buffer and use pdf-parse/mammoth
    // For now, use the filename as context
    const data = await geminiService.analyzeMaterial(
      `Analyzing material: ${req.file.originalname}`,
      req.file.originalname
    );
    res.json(data);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    if (!message) throw new ApiError(400, 'Message cannot be empty');

    const data = await geminiService.chat(message, { userRole: req.user.role, pageContext: context });
    res.json(data);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

exports.generateMasterclass = async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic) throw new ApiError(400, 'Topic is required to generate a Masterclass lesson');

    const data = await geminiService.generateMasterclass(topic);
    res.json(data);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
