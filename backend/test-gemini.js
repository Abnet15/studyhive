const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testProLatest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log('Testing model: gemini-pro-latest');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });
    const result = await model.generateContent("Help me out, say hello!");
    console.log(`  Response:`, result.response.text());
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

testProLatest();
