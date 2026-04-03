const ai = require('./src/utils/ai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function testAIFallback() {
  console.log("Testing AI Fallback Logic...");
  try {
    const result = await ai.generateSmartSummary('https://raw.githubusercontent.com/w3c/wcag/main/understanding/20/accessible-authentication.html', "Test Material");
    console.log("Success! Generated Result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testAIFallback();
