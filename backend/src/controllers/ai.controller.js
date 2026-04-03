const geminiService = require('../services/gemini.service');
const ApiError = require('../utils/ApiError');
const Bookmark = require('../models/Bookmark.model');
const Material = require('../models/Material.model');
const { extractTextFromFile } = require('../utils/ai');
const path = require('path');
const mongoose = require('mongoose');

exports.getRecommendations = async (req, res, next) => {
  try {
    // Fetch user bookmarks to get their core StudyHive topics
    const bookmarks = await Bookmark.find({ user_id: req.user.id }).populate('material_id');
    
    // Aggregate all AI topics from the materials the user is engaging with
    let learnedTopics = [];
    bookmarks.forEach(bm => {
      if (bm.material_id && bm.material_id.aiTopics) {
        learnedTopics.push(...bm.material_id.aiTopics);
      }
    });

    // Make the list unique and fallback to their academic year if blank
    const uniqueTopics = [...new Set(learnedTopics)].slice(0, 10);
    const contextStr = uniqueTopics.length > 0 
      ? `They are currently studying specific topics: ${uniqueTopics.join(', ')}.`
      : `They are a ${req.user.academic_year} student.`;

    const data = await geminiService.getRecommendations({ 
      userEmail: req.user.email,
      academicYear: req.user.academic_year,
      aiKnownTopics: contextStr
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
    
    const fileUrl = req.file.path; // from multer
    const extractedText = await extractTextFromFile(fileUrl);
    
    if (!extractedText || extractedText.trim().length === 0) {
       throw new ApiError(400, "Could not extract text from the file.");
    }

    const data = await geminiService.analyzeMaterial(
      extractedText,
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
    const { topic, materialId } = req.body;
    
    let resolvedTopic = topic;
    let contentSnippet = '';

    if (materialId && mongoose.Types.ObjectId.isValid(materialId)) {
      const material = await Material.findById(materialId);
      if (material) {
        resolvedTopic = material.title;
        if (material.fileUrl) {
           contentSnippet = await extractTextFromFile(material.fileUrl);
        }
      }
    }

    if (!resolvedTopic) throw new ApiError(400, 'Topic or valid materialId is required to generate a Masterclass lesson');

    const data = await geminiService.generateMasterclass(resolvedTopic, contentSnippet);
    res.json({ ...data, topic: resolvedTopic });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
