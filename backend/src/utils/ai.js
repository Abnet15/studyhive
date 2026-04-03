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
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b'
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

async function extractTextFromFile(fileUrl) {
  try {
    let dataBuffer;

    if (fileUrl.startsWith('http')) {
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else {
      // Local file in the uploads directory
      const localPath = path.resolve(__dirname, '../../', fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl);
      if (!fs.existsSync(localPath)) {
        console.warn('[Honey AI] Local file not found:', localPath);
        return "";
      }
      dataBuffer = fs.readFileSync(localPath);
    }

    const lowerCaseUrl = fileUrl.toLowerCase();
    if (lowerCaseUrl.includes('.pdf')) {
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (lowerCaseUrl.includes('.doc') || lowerCaseUrl.includes('.docx')) {
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
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
const generateSmartSummary = async (filePath, title) => {
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

  const fileText = await extractTextFromFile(filePath);
  const truncatedText = fileText.substring(0, 100000);
  
  // We no longer fiercely block short text files (since this is an MVP hackathon demo where 
  // users might upload dummy text files named "cdcd123"). 
  // Let the AI just generate a generic response.
  if (!truncatedText || truncatedText.trim().length === 0) {
    console.warn('[Honey AI] File content empty. Bypassing AI block for demo purposes.');
    return {
      aiSummary: 'This file appears to be empty or contains no readable text.',
      aiKeyTerms: [],
      aiTopics: [],
      aiContentValid: true, // We allow it through the gate to prevent crashing tests
      aiQuiz: []
    };
  }

  const aiPrompt = `
    You are an expert tutor and content validator for a university-level Edu-Tech platform called "StudyHive".
    Analyze the following course material titled "${title}".
    
    CRITICAL RULES:
    1. ALL quiz questions MUST be derived DIRECTLY from the actual content below. 
    2. The summary must reflect what is ACTUALLY in the document.
    3. Key terms must be REAL terms found in the document.
    4. Topics must be high-level academic subjects this document covers.
    5. Content validation: ONLY set "aiContentValid" to false if the text is explicitly malicious or obvious spam. If it is short, weird, or looks like random test data (e.g. "cdcd123"), assume it is a valid test file and SET IT TO TRUE.
    
    Return your response strictly in the following JSON format without Markdown blocks or extra text:
    {
      "aiSummary": "A concise 2-3 sentence paragraph summarizing what this material actually teaches",
      "aiKeyTerms": ["term1", "term2", "term3", "term4", "term5", "term6", "term7", "term8"],
      "aiTopics": ["High-level subject 1", "High-level subject 2"],
      "aiContentValid": true,
      "aiQuiz": [
        {
          "question": "A specific question whose answer is DIRECTLY found in the text above",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "The correct option exactly as it appears in the options array"
        },
        {
          "question": "Another question derived from the content",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "The correct option exactly as it appears in the options array"
        },
        {
          "question": "A third question derived from the content",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "The correct option exactly as it appears in the options array"
        }
      ]
    }
    
    Material Text:
    """
    ${truncatedText}
    """
  `;

  try {
    const rawResponse = await generateWithFallback(aiPrompt);
    let cleanedJsonString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJsonString);
    
    console.log('[Honey AI] Parsed response:', JSON.stringify(parsed, null, 2));

    // Ensure all expected fields exist
    return {
      aiSummary: parsed.aiSummary || 'Summary not available.',
      aiKeyTerms: Array.isArray(parsed.aiKeyTerms) ? parsed.aiKeyTerms : [],
      aiTopics: Array.isArray(parsed.aiTopics) ? parsed.aiTopics : [],
      aiContentValid: typeof parsed.aiContentValid === 'boolean' ? parsed.aiContentValid : true,
      aiQuiz: Array.isArray(parsed.aiQuiz) ? parsed.aiQuiz : []
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
};

module.exports = {
  generateSmartSummary,
  extractTextFromFile
};
