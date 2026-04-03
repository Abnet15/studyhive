const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const ai = require('./src/utils/ai');
const path = require('path');

async function verifyAI() {
  console.log("=== HONEY AI FULL SYSTEM CHECK ===");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing from .env!");
    return;
  }
  console.log("✅ API Key detected.");

  const testText = `
    Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water. 
    Photosynthesis in plants generally involves the green pigment chlorophyll and generates oxygen as a byproduct. 
    The process can be summarized by the following chemical equation: 6CO2 + 6H2O → C6H12O6 + 6O2.
    It occurs primarily in the chloroplasts of plant cells.
  `;

  const aiPrompt = `
    You are an expert tutor for a university-level Edu-Tech platform. 
    Analyze the following course material titled "Introduction to Biology".
    
    Return your response strictly in the following JSON format without Markdown blocks or extra text:
    {
      "aiSummary": "A concise paragraph summarizing the material",
      "aiKeyTerms": ["term1", "term2", "term3"],
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
    ${testText}
    """
  `;

  console.log("⏳ Sending payload to Gemini AI Fallback network...");
  
  // Expose the hierarchy directly for testing
  const MODEL_HIERARCHY = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  let rawResponse = null;

  for (const modelName of MODEL_HIERARCHY) {
    try {
      console.log(`[Honey AI] Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(aiPrompt);
      const response = await result.response;
      rawResponse = response.text();
      
      console.log(`✅ Success using ${modelName}!`);
      break; 
    } catch (err) {
      console.warn(`⚠️ Error using ${modelName}: ${err.message}. Falling back...`);
    }
  }

  if (!rawResponse) {
    console.error("❌ ALL MODELS FAILED!");
    return;
  }

  console.log("\n--- Raw String Response ---");
  console.log(rawResponse);

  console.log("\n--- JSON Parsing Test ---");
  try {
    let cleanedJsonString = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJsonString);
    console.log("✅ JSON Parsing Successful!");
    console.log("Summary:", parsedData.aiSummary);
    console.log("Key Terms:", parsedData.aiKeyTerms.length);
    console.log("Quiz Questions:", parsedData.aiQuiz?.length);
    console.log("\nSample Quiz Question:");
    console.log(parsedData.aiQuiz[0]);
  } catch(e) {
    console.error("❌ JSON PARSING FAILED. The AI model did not return strict JSON.");
    console.error(e.message);
  }
}

verifyAI();
