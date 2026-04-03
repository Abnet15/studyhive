const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

class GeminiService {
  constructor() {
    if (!config.ai.geminiApiKey) {
      console.warn('GEMINI_API_KEY is not defined in .env! AI features will fail.');
    }
    this.genAI = new GoogleGenerativeAI(config.ai.geminiApiKey || 'dummy_key');
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });
  }

  async generateQuiz(topic, difficulty = 'medium') {
    const prompt = `Generate a quiz about the topic "${topic}" with difficulty "${difficulty}". 
    Exactly 5 questions.
    Return a JSON object with a "quiz" array. Each item:
    - "question": string
    - "options": array of strings (4 options)
    - "correctAnswer": integer (0-3) index.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      console.error('[GeminiService] Quiz Generation Error:', err);
      throw new Error('Could not generate quiz.');
    }
  }

  async getRecommendations(userStats) {
    const prompt = `Based on the following student state: ${JSON.stringify(userStats)}, 
    generate 3 concise, motivating study recommendations for today. 
    Format: Plain text, bullet points. Be brief but specific.`;

    try {
      const result = await this.model.generateContent(prompt);
      return { recommendation: result.response.text() };
    } catch (err) {
      console.error('[GeminiService] Recommendations Error:', err);
      throw new Error('Could not fetch recommendations.');
    }
  }

  async analyzeMaterial(content, title) {
    const prompt = `Title: ${title}\nContent snippet: ${content.substring(0, 5000)}\n\n
    Analyze the above course material. Provide a clear, structured summary and explain the core concepts as if you were a helpful tutor.`;

    try {
      const result = await this.model.generateContent(prompt);
      return { analysis: result.response.text() };
    } catch (err) {
      console.error('[GeminiService] Analysis Error:', err);
      throw new Error('Could not analyze file.');
    }
  }

  async chat(message, contextData = {}) {
    // Basic chat state for context augmentation
    const prompt = `You are "Honey", a helpful AI study assistant for university students. 
    Context: ${JSON.stringify(contextData)}
    User: ${message}
    Honey:`;

    try {
      const result = await this.model.generateContent(prompt);
      return { reply: result.response.text() };
    } catch (err) {
      console.error('[GeminiService] Chat Error:', err);
      throw new Error('AI lost its connection to the hive.');
    }
  }
}

module.exports = new GeminiService();
