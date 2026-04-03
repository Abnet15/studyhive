const geminiService = require('./src/services/gemini.service');
require('dotenv').config();

async function test() {
  console.log('--- Testing Masterclass Generation ---');
  try {
    const data = await geminiService.generateMasterclass('Photosynthesis', 'Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy.');
    console.log('SUCCESS!');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('FAILED!');
    console.error(err);
  }
}

test();
