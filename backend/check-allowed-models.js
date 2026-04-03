const axios = require('axios');
require('dotenv').config();

async function test() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  
  try {
    console.log('Listing allowed models...');
    const res = await axios.get(url);
    console.log('SUCCESS!');
    res.data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
            console.log(`- ${m.name}`);
        }
    });
  } catch (err) {
    console.error('FAILED TO LIST MODELS!');
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

test();
