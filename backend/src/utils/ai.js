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

/**
 * Detect file type from buffer magic bytes when extensions/names are unreliable.
 */
function detectMimeFromBuffer(buffer) {
  if (!buffer || buffer.length < 8) return 'unknown';
  // PDF: starts with %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return 'application/pdf';
  // ZIP (also docx, pptx, xlsx): starts with PK
  if (buffer[0] === 0x50 && buffer[1] === 0x4B) return 'application/zip';
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
  // WEBP (RIFF....WEBP)
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && buffer.length > 11 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return 'image/webp';
  return 'unknown';
}

/**
 * Core extraction logic — works on a raw buffer + filename/extension hints.
 * Used by both extractTextFromFile (path-based) and extractTextFromBuffer (multer-based).
 */
async function extractFromBuffer(dataBuffer, originalName = '', sourceHint = '') {
  const lowerName = originalName.toLowerCase();
  const lowerHint = sourceHint.toLowerCase();

  // Archives bypass
  if (['.zip', '.rar', '.tar', '.gz', '.7z'].some(ext => lowerName.endsWith(ext))) {
    return '[ARCHIVE_FILE]';
  }

  // Detect type from extension first, then fall back to magic bytes
  let fileType = 'unknown';
  if (lowerName.endsWith('.pdf') || lowerHint.includes('.pdf')) fileType = 'pdf';
  else if (lowerName.endsWith('.docx') || lowerHint.includes('.docx')) fileType = 'docx';
  else if (lowerName.endsWith('.doc') || lowerHint.includes('.doc')) fileType = 'doc';
  else if (lowerName.endsWith('.pptx') || lowerName.endsWith('.ppt') || lowerHint.includes('.ppt')) fileType = 'ppt';
  else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].some(ext => lowerName.endsWith(ext))) fileType = 'image';
  else if (['.txt', '.md', '.csv', '.json', '.js', '.py', '.java', '.c', '.cpp', '.html', '.css', '.xml', '.yaml', '.yml', '.log'].some(ext => lowerName.endsWith(ext))) fileType = 'text';

  // If extension didn't match, use magic bytes
  if (fileType === 'unknown') {
    const mime = detectMimeFromBuffer(dataBuffer);
    console.log(`[Honey AI] Extension detection failed for "${originalName}", magic-byte MIME: ${mime}`);
    if (mime === 'application/pdf') fileType = 'pdf';
    else if (mime === 'application/zip') {
      // ZIP could be docx/pptx/xlsx — check originalName more carefully
      if (lowerName.includes('docx')) fileType = 'docx';
      else if (lowerName.includes('pptx') || lowerName.includes('ppt')) fileType = 'ppt';
      else fileType = 'docx'; // default: try mammoth → officeparser
    }
    else if (mime.startsWith('image/')) fileType = 'image';
  }

  console.log(`[Honey AI] Extracting text — type: ${fileType}, file: "${originalName}", buffer: ${dataBuffer.length} bytes`);

  let extractedText = '';

  try {
    if (fileType === 'pdf') {
      try {
        const data = await pdfParse(dataBuffer);
        extractedText = data.text || '';
        console.log(`[Honey AI] pdf-parse extracted ${extractedText.length} chars`);
      } catch (pdfErr) {
        console.warn(`[Honey AI] pdf-parse failed: ${pdfErr.message}. Trying Vision OCR...`);
      }
    } else if (fileType === 'docx' || fileType === 'doc') {
      try {
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        extractedText = result.value || '';
        console.log(`[Honey AI] mammoth extracted ${extractedText.length} chars`);
      } catch (mammothErr) {
        console.warn(`[Honey AI] mammoth failed: ${mammothErr.message}. Trying officeparser...`);
        try {
          extractedText = await parseOffice(dataBuffer);
          console.log(`[Honey AI] officeparser extracted ${(extractedText || '').length} chars`);
        } catch (officeErr) {
          console.warn(`[Honey AI] officeparser also failed: ${officeErr.message}`);
        }
      }
    } else if (fileType === 'ppt') {
      try {
        extractedText = await parseOffice(dataBuffer);
        console.log(`[Honey AI] officeparser (ppt) extracted ${(extractedText || '').length} chars`);
      } catch (officeErr) {
        console.warn(`[Honey AI] officeparser (ppt) failed: ${officeErr.message}`);
      }
    } else if (fileType === 'image') {
      // Images have no text to parse — go straight to Vision OCR
      console.log('[Honey AI] Image file detected — skipping text parsers, will use Vision OCR.');
    } else if (fileType === 'text') {
      extractedText = dataBuffer.toString('utf8');
      console.log(`[Honey AI] Plain text read: ${extractedText.length} chars`);
    } else {
      // Unknown type — try reading as utf8 text first
      const rawText = dataBuffer.toString('utf8');
      // Check if it looks like valid text (not binary garbage)
      const printableRatio = rawText.substring(0, 1000).replace(/[^\x20-\x7E\r\n\t]/g, '').length / Math.min(rawText.length, 1000);
      if (printableRatio > 0.85) {
        extractedText = rawText;
        console.log(`[Honey AI] Treated as plain text (${(printableRatio * 100).toFixed(0)}% printable): ${extractedText.length} chars`);
      } else {
        console.log(`[Honey AI] Binary file detected (${(printableRatio * 100).toFixed(0)}% printable) — will try Vision OCR.`);
      }
    }
  } catch (parseErr) {
    console.error(`[Honey AI] Parser threw unexpected error: ${parseErr.message}`);
  }

  // ── VISION OCR FALLBACK ─────────────────────────────────────────────────────
  if (!extractedText || extractedText.trim().length === 0) {
    console.warn('[Honey AI] Standard extraction returned empty. Attempting Vision OCR fallback...');
    try {
      const visionText = await extractWithGeminiVision(sourceHint || null, originalName, dataBuffer);
      if (visionText && visionText.trim().length > 20) {
        console.log(`[Honey AI] ✅ Vision OCR succeeded! Extracted ${visionText.length} chars.`);
        return visionText;
      }
    } catch (visionErr) {
      console.warn(`[Honey AI] Vision OCR fallback failed: ${visionErr.message}`);
    }
  }

  return extractedText || '';
}

/**
 * Extract text from a file path or URL — the legacy interface.
 */
async function extractTextFromFile(fileUrl, originalName = '') {
  try {
    let dataBuffer;

    if (fileUrl.startsWith('http')) {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else {
      let localPath = fileUrl;
      if (!path.isAbsolute(fileUrl)) {
        localPath = path.resolve(__dirname, '../../', fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl);
      }
      if (!fs.existsSync(localPath)) {
        console.warn('[Honey AI] Local file not found:', localPath);
        return '';
      }
      dataBuffer = fs.readFileSync(localPath);
    }

    return await extractFromBuffer(dataBuffer, originalName, fileUrl);
  } catch (err) {
    console.error('[Honey AI] Failed to extract text from file:', err.message);
    return '';
  }
}

/**
 * Extract text directly from a multer file object's buffer or disk path.
 * This is the preferred method for uploaded files — avoids re-reading from disk.
 */
async function extractTextFromUpload(multerFile) {
  try {
    let dataBuffer;
    if (multerFile.buffer) {
      dataBuffer = multerFile.buffer;
    } else if (multerFile.path) {
      if (!fs.existsSync(multerFile.path)) {
        console.warn('[Honey AI] Uploaded file not found on disk:', multerFile.path);
        return '';
      }
      dataBuffer = fs.readFileSync(multerFile.path);
    } else {
      console.warn('[Honey AI] Multer file has neither buffer nor path');
      return '';
    }
    return await extractFromBuffer(dataBuffer, multerFile.originalname || '', multerFile.path || '');
  } catch (err) {
    console.error('[Honey AI] Failed to extract text from upload:', err.message);
    return '';
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
  
  if (fileText === "[ARCHIVE_FILE]") {
    return {
      aiSummary: 'Archive/ZIP file successfully uploaded! AI text extraction is automatically disabled for compressed folders, but your file is safe and ready for download.',
      aiKeyTerms: ['Archive', 'Compressed Format'],
      aiTopics: ['Uncategorized'],
      aiContentValid: true,
      aiQuiz: []
    };
  }

  const truncatedText = fileText.substring(0, 100000);
  
  if (!truncatedText || truncatedText.trim().length === 0) {
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
async function extractWithGeminiVision(filePath, originalName, preloadedBuffer = null) {
  if (!genAI) throw new Error('No Gemini API key for Vision OCR');

  let dataBuffer = preloadedBuffer;
  
  if (!dataBuffer) {
    if (filePath && filePath.startsWith('http')) {
      const response = await axios.get(filePath, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else if (filePath) {
      let localPath = filePath;
      if (!path.isAbsolute(filePath)) {
        localPath = path.resolve(__dirname, '../../', filePath.startsWith('/') ? filePath.slice(1) : filePath);
      }
      if (!fs.existsSync(localPath)) throw new Error('File not found for Vision OCR');
      dataBuffer = fs.readFileSync(localPath);
    } else {
      throw new Error('No buffer and no valid filePath provided for Vision OCR');
    }
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
  extractTextFromFile,
  extractTextFromUpload
};
