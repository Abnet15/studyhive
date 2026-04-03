const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

// We use the same exact array that succeeded in the server background diagnostics.
const MODEL_HIERARCHY = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b'
];

class GeminiService {
  constructor() {
    if (!config.ai.geminiApiKey) {
      console.warn('GEMINI_API_KEY is not defined in .env! AI features will fail.');
    }
    this.genAI = new GoogleGenerativeAI(config.ai.geminiApiKey || 'dummy_key');
  }

  // Common fallback execution method mapping backend architecture
  async runWithFallback(prompt, expectsJson = false) {
    let lastError = null;
    for (const modelName of MODEL_HIERARCHY) {
      try {
        const payload = { model: modelName };
        if (expectsJson) payload.generationConfig = { responseMimeType: "application/json" };
        
        const model = this.genAI.getGenerativeModel(payload);
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiService] ${modelName} failed: ${err.message}. Trying next...`);
      }
    }
    throw new Error(`All fallback Gemini models failed: ${lastError?.message}`);
  }

  async generateQuiz(topic, difficulty = 'medium') {
    const prompt = `Generate a quiz about the topic "${topic}" with difficulty "${difficulty}". 
    Exactly 5 questions.
    Return a strict JSON object with a "quiz" array. Each item:
    - "question": string
    - "options": array of strings (4 options)
    - "correctAnswer": integer (0-3) index.`;

    try {
      const text = await this.runWithFallback(prompt, true);
      // Clean possible markdown JSON wrappers just in case
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (err) {
      console.error('[GeminiService] Quiz Generation Error:', err);
      throw new Error('Could not generate quiz.');
    }
  }

  async getRecommendations(userStats) {
    const prompt = `Based on the following student state: ${JSON.stringify(userStats)}, 
    generate 3 concise, motivating study recommendations for today. 
    Make sure to tailor the recommendations specifically based on the topics they have been studying.
    Format: Plain text, bullet points. Be brief but specific.`;

    try {
      const text = await this.runWithFallback(prompt);
      return { recommendation: text };
    } catch (err) {
      console.error('[GeminiService] Recommendations Error:', err);
      throw new Error('Could not fetch recommendations.');
    }
  }

  async analyzeMaterial(content, title) {
    const prompt = `Title: ${title}\nContent snippet: ${content.substring(0, 5000)}\n\n
    Analyze the above course material. Provide a clear, structured summary and explain the core concepts as if you were a helpful tutor.`;

    try {
      const text = await this.runWithFallback(prompt);
      return { analysis: text };
    } catch (err) {
      console.error('[GeminiService] Analysis Error:', err);
      throw new Error('Could not analyze file.');
    }
  }

  async chat(message, contextData = {}) {
    const prompt = `You are "Honey", a helpful AI study assistant for university students. 
    Context: ${JSON.stringify(contextData)}
    User: ${message}
    Honey:`;

    try {
      const text = await this.runWithFallback(prompt);
      return { reply: text };
    } catch (err) {
      console.error('[GeminiService] Chat Error:', err);
      throw new Error('AI lost its connection to the hive.');
    }
  }

  async generateMasterclass(topic) {
    const prompt = `You are the world's greatest practical tutor (like from Khan Academy or CrashCourse).
    Create a highly engaging, practical visual lesson about: "${topic}".
    
    Return strict JSON matching this format EXACTLY:
    {
      "youtubeQuery": "A highly targeted YouTube search query to find the best real video tutorial for this topic",
      "scenes": [
        {
          "teacherScript": "An enthusiastic, engaging spoken script tailored specifically for this slide. Speak directly to the student in 1st person. 2-3 sentences max per scene.",
          "title": "Slide concept",
          "icon": "Emoji representation",
          "codeSnippet": "Optional practical code or formula to display",
          "bulletPoints": ["Point 1", "Point 2"]
        }
      ]
    }`;

    try {
      const text = await this.runWithFallback(prompt, true);
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.error('[GeminiService] Masterclass Generation Error:', err);
      throw new Error('Could not generate the interactive masterclass.');
    }
  }
}

module.exports = new GeminiService();
