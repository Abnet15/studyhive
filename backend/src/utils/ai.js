const axios = require('axios');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Fallback hierarchy (Best to next best)
const MODEL_HIERARCHY = [
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
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
      console.log(`[Askuala AI] Attempting generation with model: ${modelName} `);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`[Askuala AI] Success using ${modelName}!`);
      return text;
      
    } catch (err) {
      console.warn(`[Askuala AI] Error using ${modelName}: ${err.message}. Falling back to next best model...`);
    }
  }

  throw new Error("All Gemini models in the fallback hierarchy failed.");
}

async function extractTextFromFile(fileUrl) {
  try {
    // If it's a local mock test or relative path fallback
    if (!fileUrl.startsWith('http')) {
      return "No valid HTTP URL provided for extraction.";
    }

    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data);

    if (fileUrl.toLowerCase().includes('.pdf')) {
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else {
      // Basic text read for .txt or other extensions
      return dataBuffer.toString('utf8');
    }
  } catch (err) {
    console.error('[Askuala AI] Failed to extract text from URL:', err.message);
    return "";
  }
}

/**
 * Parses file and automatically generates Smart Summary
 */
const generateSmartSummary = async (filePath, title) => {
  if (!genAI) {
    console.log('[Askuala AI] No API key found. Using Mock AI Response.');
    return {
      aiSummary: `This is a mock AI summary for ${title} because no GEMINI_API_KEY is detected.`,
      aiKeyTerms: [title, 'Mock', 'Askuala', 'AI'],
      aiQuiz: []
    };
  }

  const fileText = await extractTextFromFile(filePath);
  
  // Truncate text if it's too long to prevent throwing crazy context limit errors
  // gemini-1.5 models support 1M+ tokens, so truncation at 100k chars is well within limit
  const truncatedText = fileText.substring(0, 100000); 

  const aiPrompt = `
    You are an expert tutor for a university-level Edu-Tech platform. 
    Analyze the following course material titled "${title}".
    
    Return your response strictly in the following JSON format without Markdown blocks or extra text:
    {
      "aiSummary": "A concise paragraph summarizing the material",
      "aiKeyTerms": ["term1", "term2", "term3", "term4", "term5"],
      "aiQuiz": [
        {
          "question": "generate a multiple choice question",
          "options": ["A", "B", "C", "D"],
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
    
    // Clean markdown formatting if model adds it (e.g. ```json ... ```)
    let cleanedJsonString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedJsonString);
  } catch (error) {
    console.error('[Askuala AI] Critical Error generating Smart Summary:', error);
    
    // Graceful fallback
    return {
      aiSummary: 'AI was unable to generate a summary for this material due to an API error.',
      aiKeyTerms: [],
      aiQuiz: []
    };
  }
};

module.exports = {
  generateSmartSummary
};
