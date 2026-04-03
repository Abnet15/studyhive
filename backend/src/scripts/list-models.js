require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Missing GEMINI_API_KEY in .env file!');
  process.exit(1);
}

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${apiKey}`,
  method: 'GET',
};

console.log('Fetching available Gemini Models...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.error) {
        console.error('Error fetching models:', parsedData.error.message);
        return;
      }

      console.log('✅ Available Models:');
      console.log('--------------------------------------------------');
      const models = parsedData.models || [];
      
      models.forEach((model) => {
        // We only care about generative models for our purpose
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${model.name.replace('models/', '')}`);
          console.log(`  Description: ${model.description}`);
          console.log(`  Input Limit: ${model.inputTokenLimit} tokens`);
          console.log('--------------------------------------------------');
        }
      });
    } catch (e) {
      console.error('Failed to parse response:', e);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.end();
