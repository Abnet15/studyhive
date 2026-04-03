const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    console.log('Testing key:', process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const res = await model.generateContent("test");
    console.log('Success with gemini-1.5-flash');
  } catch (e) {
    console.error('Error detail:');
    console.dir(e, { depth: null });
  }
}

test();
