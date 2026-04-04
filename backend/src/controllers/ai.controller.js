const geminiService = require('../services/gemini.service');
const ApiError = require('../utils/ApiError');
const Bookmark = require('../models/Bookmark.model');
const Material = require('../models/Material.model');
const { extractTextFromFile, extractTextFromUpload } = require('../utils/ai');
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
    
    // Use the robust upload extractor
    const extractedText = await extractTextFromUpload(req.file);
    
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

exports.extractFileText = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'No file uploaded for extraction');
    
    // Use the robust upload extractor
    const extractedText = await extractTextFromUpload(req.file);
    
    if (!extractedText || extractedText.trim().length === 0) {
       throw new ApiError(400, "Could not extract text from the file.");
    }

    res.json({ extractedText, filename: req.file.originalname });
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
    const { topic, materialId, teacherPersona, duration, providedSnippet } = req.body;
    
    let resolvedTopic = topic;
    let contentSnippet = providedSnippet || '';
    let keyTerms = [];

    if (materialId && mongoose.Types.ObjectId.isValid(materialId)) {
      const material = await Material.findById(materialId);
      if (material) {
        resolvedTopic = material.title;
        keyTerms = material.aiKeyTerms || [];
        if (material.fileUrl) {
           contentSnippet = await extractTextFromFile(material.fileUrl, material.originalName || '');
        }
      }
    }

    if (!resolvedTopic) throw new ApiError(400, 'Topic or valid materialId is required to generate a Masterclass lesson');

    const data = await geminiService.generateMasterclass(resolvedTopic, contentSnippet, teacherPersona, duration, keyTerms);
    res.json({ ...data, topic: resolvedTopic });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

exports.voiceChat = async (req, res, next) => {
  try {
    const { mode, context, history, language } = req.body;
    
    if (!mode) throw new ApiError(400, 'Mode is required (interview or english)');

    let resolvedContext = context || '';

    // If a file was uploaded with the request, extract its text and append to context
    if (req.file) {
      const extractedText = await extractTextFromUpload(req.file);
      if (extractedText) {
        resolvedContext += `\n\n[FILE CONTEXT PROVIDED BY USER]:\n${extractedText.substring(0, 15000)}`;
      }
    }

    let parsedHistory = [];
    if (history) {
      try { parsedHistory = JSON.parse(history); } 
      catch (e) { parsedHistory = history; } // if it's already an array
    }

    const data = await geminiService.voiceConversation(mode, resolvedContext, parsedHistory, language || 'en');
    res.json(data);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

exports.getExitExamDiagnostic = async (req, res, next) => {
  try {
    const { department } = req.params;
    if (!department) throw new ApiError(400, 'Department parameter is required');

    const diagnostic = await geminiService.generateExitExamDiagnostic(department);
    res.json(diagnostic);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};

const ExamScore = require('../models/ExamScore.model');
exports.submitExitExam = async (req, res, next) => {
  try {
    const { department, scores, totalScore, totalMaxScore } = req.body;
    
    if (!department || !scores) {
      throw new ApiError(400, 'Missing required exam data');
    }

    const examRecord = new ExamScore({
      user_id: req.user.id,
      department,
      scores,
      totalScore,
      totalMaxScore
    });

    await examRecord.save();
    res.status(201).json({ message: 'Exam scores saved successfully!', record: examRecord });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
