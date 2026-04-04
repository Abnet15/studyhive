const axios = require('axios');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Fallback hierarchy (Best free model to next best)
const MODEL_HIERARCHY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-pro-latest',
  'gemini-flash-latest'
];

/**
 * Attempts to generate content using the defined model hierarchy.
 */
async function generateWithFallback(prompt) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  for (const modelName of MODEL_HIERARCHY) {
    try {
      console.log(`[Honey AI] Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`[Honey AI] Success using ${modelName}!`);
      return text;
      
    } catch (err) {
      console.warn(`[Honey AI] Error using ${modelName}: ${err.message}. Falling back...`);
    }
  }

  throw new Error("All Gemini models in the fallback hierarchy failed.");
}

const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { parseOffice } = require('officeparser');

async function extractTextFromFile(fileUrl, originalName = '') {
  try {
    let dataBuffer;

    if (fileUrl.startsWith('http')) {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else {
      // Local file in the uploads directory
      let localPath = fileUrl;
      // If multer gave us a relative path, resolve it relative to backend root
      if (!path.isAbsolute(fileUrl)) {
         localPath = path.resolve(__dirname, '../../', fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl);
      }
      
      if (!fs.existsSync(localPath)) {
        console.warn('[Honey AI] Local file not found:', localPath);
        return "";
      }
      dataBuffer = fs.readFileSync(localPath);
    }

    const lowerCaseUrl = fileUrl.toLowerCase();
    const lowerCaseName = originalName.toLowerCase();
    
    if (lowerCaseUrl.includes('.pdf') || lowerCaseName.includes('.pdf')) {
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (lowerCaseUrl.includes('.docx') || lowerCaseName.includes('.docx') || lowerCaseUrl.includes('.doc') || lowerCaseName.includes('.doc')) {
      try {
         const result = await mammoth.extractRawText({ buffer: dataBuffer });
         return result.value;
      } catch (err) {
         // Fallback to officeparser if mammoth fails
         return await parseOffice(dataBuffer);
      }
    } else if (lowerCaseUrl.includes('.pptx') || lowerCaseName.includes('.pptx') || lowerCaseUrl.includes('.ppt') || lowerCaseName.includes('.ppt')) {
      // Use officeparser strictly for PowerPoint files
      return await parseOffice(dataBuffer);
    } else {
      return dataBuffer.toString('utf8');
    }
  } catch (err) {
    console.error('[Honey AI] Failed to extract text from file:', err.message);
    return "";
  }
}

/**
 * Parses file and generates: Summary, Key Terms, Topics, Quiz, and Content Validation
 * Quiz questions are STRICTLY derived from the actual file content.
 */
const generateSmartSummary = async (filePath, title, originalName = '') => {
  if (!genAI) {
    console.log('[Honey AI] No API key found. Using Mock AI Response.');
    return {
      aiSummary: `This is a mock AI summary for ${title} because no GEMINI_API_KEY is detected.`,
      aiKeyTerms: [title, 'Mock', 'Honey', 'AI'],
      aiTopics: ['General Education'],
      aiContentValid: true,
      aiQuiz: []
    };
  }

  const fileText = await extractTextFromFile(filePath, originalName);
  const truncatedText = fileText.substring(0, 100000);
  
  // ── VISION OCR FALLBACK ─────────────────────────────────────────────────────
  // If standard text extraction returned nothing, attempt Gemini Vision to read
  // scanned PDFs, images, and heavily-formatted documents before giving up.
  if (!truncatedText || truncatedText.trim().length === 0) {
    console.warn('[Honey AI] Standard text extraction returned empty. Attempting Vision OCR fallback...');
    
    const lowerName = originalName.toLowerCase();
    
    // Archives bypass — they genuinely have no readable text
    if (lowerName.endsWith('.zip') || lowerName.endsWith('.rar') || lowerName.endsWith('.tar') || lowerName.endsWith('.gz')) {
      return {
        aiSummary: 'Archive/ZIP file successfully uploaded! AI text extraction is automatically disabled for compressed folders, but your file is safe and ready for download.',
        aiKeyTerms: ['Archive', 'Compressed Format'],
        aiTopics: ['Uncategorized'],
        aiContentValid: true,
        aiQuiz: []
      };
    }

    // Attempt Gemini Vision OCR for images and scanned docs
    try {
      const visionText = await extractWithGeminiVision(filePath, originalName);
      if (visionText && visionText.trim().length > 20) {
        console.log('[Honey AI] ✅ Vision OCR succeeded! Extracted', visionText.length, 'chars.');
        // Re-run the full AI pipeline with the vision-extracted text
        return await runAIPipeline(visionText, title);
      }
    } catch (visionErr) {
      console.warn('[Honey AI] Vision OCR fallback failed:', visionErr.message);
    }

    // If even Vision OCR couldn't read it, THEN reject
    return {
      aiSummary: 'This file contains no readable content even after AI Vision analysis. Please upload a file with actual text or image content.',
      aiKeyTerms: [],
      aiTopics: [],
      aiContentValid: false,
      aiQuiz: []
    };
  }

  // Standard path — we have text, run the AI pipeline
  return await runAIPipeline(truncatedText, title);
};

/**
 * Gemini Vision OCR — sends the raw file bytes to Gemini's multimodal model
 * to extract text from scanned PDFs, images, and heavily formatted documents.
 */
async function extractWithGeminiVision(filePath, originalName) {
  if (!genAI) throw new Error('No Gemini API key for Vision OCR');

  let dataBuffer;
  if (filePath.startsWith('http')) {
    const response = await axios.get(filePath, { responseType: 'arraybuffer' });
    dataBuffer = Buffer.from(response.data);
  } else {
    let localPath = filePath;
    if (!path.isAbsolute(filePath)) {
      localPath = path.resolve(__dirname, '../../', filePath.startsWith('/') ? filePath.slice(1) : filePath);
    }
    if (!fs.existsSync(localPath)) throw new Error('File not found for Vision OCR');
    dataBuffer = fs.readFileSync(localPath);
  }

  // Determine MIME type
  const lowerName = originalName.toLowerCase();
  let mimeType = 'application/pdf';
  if (lowerName.endsWith('.png')) mimeType = 'image/png';
  else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mimeType = 'image/jpeg';
  else if (lowerName.endsWith('.webp')) mimeType = 'image/webp';
  else if (lowerName.endsWith('.gif')) mimeType = 'image/gif';

  const base64Data = dataBuffer.toString('base64');

  // Try each model in the hierarchy for vision
  for (const modelName of MODEL_HIERARCHY) {
    try {
      console.log(`[Honey AI Vision] Attempting OCR with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        {
          text: `You are an expert OCR and document reader. Extract ALL readable text content from this document/image. 
Include every heading, paragraph, caption, label, code snippet, table data, and footnote you can see.
Return ONLY the extracted text, nothing else. No commentary, no formatting instructions.
If the document contains diagrams or charts, describe what they show briefly.
Extract as much text as humanly possible.`
        }
      ]);

      const response = await result.response;
      const text = response.text();
      console.log(`[Honey AI Vision] ✅ OCR success with ${modelName}, extracted ${text.length} chars`);
      return text;
    } catch (err) {
      console.warn(`[Honey AI Vision] ${modelName} failed:`, err.message);
    }
  }

  throw new Error('All Vision models failed to extract text');
}

/**
 * Core AI Analysis Pipeline — takes extracted text and generates
 * Summary, Key Terms, Topics, Content Validation, and Quiz.
 * Reusable by both standard extraction and Vision OCR fallback paths.
 */
async function runAIPipeline(textContent, title) {
  const truncated = textContent.substring(0, 100000);

  const aiPrompt = `
    You are an expert academic tutor and content validator for "StudyHive", a premium university learning platform.
    Analyze the provided course material titled "${title}".
    
    CRITICAL RULES FOR GENERATION:
    1. DOCUMENT-SPECIFIC: ALL quiz questions MUST be derived DIRECTLY from the factual concepts in the content below. 
    2. NO META-QUESTIONS: NEVER generate questions about the system, the file processing status, the file name, or the document structure (e.g., "Why could the system not process...").
    3. VALIDATION: If the content is too short to extract 3 meaningful questions, or if it is obvious placeholder/test text (like "cdcd123"), return an EMPTY "aiQuiz" array [].
    4. SUMMARY: Provide a professional, academic summary that explains what the document actually teaches.
    
    Return your response strictly in the following JSON format without Markdown blocks:
    {
      "aiSummary": "Summary here",
      "aiKeyTerms": ["term1", "term2", "..."],
      "aiTopics": ["Academic Subject 1", "Academic Subject 2"],
      "aiContentValid": true,
      "aiQuiz": [
        {
          "question": "A specific question derived from the text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A"
        }
      ]
    }
    
    Material Content:
    """
    ${truncated}
    """
  `;

  try {
    const rawResponse = await generateWithFallback(aiPrompt);
    let cleanedJsonString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJsonString);
    
    // Hallucination Guard: Filter out any meta-questions about the system or processing
    let quiz = Array.isArray(parsed.aiQuiz) ? parsed.aiQuiz : [];
    const forbiddenPatterns = [/system/i, /process/i, /titled/i, /material/i, /could not/i, /fail/i];
    
    quiz = quiz.filter(q => {
      const qText = q.question.toLowerCase();
      const isMeta = forbiddenPatterns.some(p => p.test(qText));
      return !isMeta;
    });

    return {
      aiSummary: parsed.aiSummary || 'Summary not available.',
      aiKeyTerms: Array.isArray(parsed.aiKeyTerms) ? parsed.aiKeyTerms : [],
      aiTopics: Array.isArray(parsed.aiTopics) ? parsed.aiTopics : [],
      aiContentValid: typeof parsed.aiContentValid === 'boolean' ? parsed.aiContentValid : true,
      aiQuiz: quiz
    };
  } catch (error) {
    console.error('[Honey AI] Critical Error generating Smart Summary:', error);
    
    return {
      aiSummary: 'AI was unable to generate a summary for this material due to an API error.',
      aiKeyTerms: [],
      aiTopics: [],
      aiContentValid: true,
      aiQuiz: []
    };
  }
}

module.exports = {
  generateSmartSummary,
  extractTextFromFile
};
