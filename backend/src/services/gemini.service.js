const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

// We use the same exact array that succeeded in the server background diagnostics.
const MODEL_HIERARCHY = [
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
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
        if (expectsJson && (modelName.includes('1.5') || modelName.includes('2.0') || modelName.includes('2.5') || modelName.includes('latest'))) {
          payload.generationConfig = { responseMimeType: "application/json" };
        }
        
        const model = this.genAI.getGenerativeModel(payload);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text) throw new Error("Empty response from AI");
        return text;
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiService] ${modelName} failed: ${err.message}`);
        // If it's a quota issue, we might want to skip other models if they share same quota, 
        // but we'll try the next anyway because sometimes different models have different buckets.
      }
    }

    // FINAL HACKATHON FALLBACK: If all models fail (quota/auth), return a helpful mock response
    console.error(`[GeminiService] CRITICAL: All models failed. Providing Mock data to keep UI alive.`);
    if (expectsJson) {
      // Return a valid empty/mock JSON structure that matches our most common needs
      if (prompt.includes('quiz')) return JSON.stringify({ quiz: [{ question: "Sample: What is StudyHive?", options: ["A platform", "A book", "A car", "A fruit"], correctAnswer: 0 }] });
      if (prompt.includes('Masterclass')) return JSON.stringify({ topic: "General Study", youtubeQuery: "study skills", scenes: [{ teacherScript: "Welcome to your AI lesson. The AI is currently busy, but let's review basic study techniques.", title: "Lesson Active", icon: "📚", bulletPoints: ["Stay organized", "Focus on core concepts"] }] });
      return JSON.stringify({});
    }
    return "Honey AI is currently resting due to high hive activity. Here is a study tip: Break your work into 25-minute Pomodoro sessions!";
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
      
      // Robust JSON extraction
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart === -1 || jsonEnd === 0) throw new Error("No JSON found in response");
      
      const cleanedText = text.substring(jsonStart, jsonEnd);
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

  async generateMasterclass(topic, fileContentSnippet = '') {
    const textContext = fileContentSnippet ? `\nCRITICAL CONTEXT: Build this lesson specifically around this text:\n"""\n${fileContentSnippet.substring(0, 50000)}\n"""\n` : '';
    
    const prompt = `You are the world's greatest practical tutor (like from Khan Academy or CrashCourse).
    Create a highly engaging, practical visual lesson about: "${topic}".
    ${textContext}
    
    Return strict JSON matching this format EXACTLY:
    {
      "youtubeQuery": "A highly targeted YouTube search query to find the best real video tutorial for this topic",
      "scenes": [
        {
          "teacherScript": "An enthusiastic, engaging spoken script tailored specifically for this slide. Speak directly to the student in 1st person. 2-3 sentences max per scene. IT MUST BE FACTUALLY BASED ON THE CRITICAL CONTEXT PROVIDED.",
          "title": "Slide concept",
          "icon": "Emoji representation",
          "codeSnippet": "Optional practical code or formula to display",
          "bulletPoints": ["Point 1 derived from text", "Point 2 derived from text"]
        }
      ]
    }`;

    try {
      const text = await this.runWithFallback(prompt, true);
      
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart === -1 || jsonEnd === 0) throw new Error("No JSON found in response");
      
      const cleaned = text.substring(jsonStart, jsonEnd);
      return JSON.parse(cleaned);
    } catch (err) {
      console.error('[GeminiService] Masterclass Generation Error:', err);
      throw new Error('Could not generate the interactive masterclass.');
    }
  }
}

module.exports = new GeminiService();
