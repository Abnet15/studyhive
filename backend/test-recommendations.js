const geminiService = require('./src/services/gemini.service');
require('dotenv').config();

async function test() {
  console.log('--- Testing Recommendations Generation ---');
  try {
    const data = await geminiService.getRecommendations({ 
      userEmail: 'test@example.com',
      academicYear: 3,
      aiKnownTopics: 'They are currently studying specific topics: Physics, Math.'
    });
    console.log('SUCCESS!');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('FAILED!');
    console.error(err);
  }
}

test();
