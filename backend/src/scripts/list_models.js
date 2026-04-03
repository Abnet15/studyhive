require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const axios = require('axios');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not defined in .env');
    return;
  }

  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const models = response.data.models;
    console.log('Available Gemini Models:');
    models.forEach(model => {
      console.log(`- ${model.name} (Version: ${model.version}, Description: ${model.description})`);
    });
  } catch (error) {
    console.error('Failed to fetch models:', error.response?.data || error.message);
  }
}

listModels();
