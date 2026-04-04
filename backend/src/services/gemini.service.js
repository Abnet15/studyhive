const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

// Updated model hierarchy — ordered by free-tier availability
// gemini-1.5-flash removed (404 deprecated from v1beta)
const MODEL_HIERARCHY = [
  'gemini-2.0-flash-lite',    // Highest free-tier quota
  'gemini-2.5-flash',          // 20 req/day free
  'gemini-2.0-flash',          // Good fallback
  'gemini-1.5-flash-8b',      // Smaller, separate quota bucket
  'gemini-flash-latest',       // Alias fallback
];

class GeminiService {
  constructor() {
    if (!config.ai.geminiApiKey) {
      console.warn('GEMINI_API_KEY is not defined in .env! AI features will fail.');
    }
    this.genAI = new GoogleGenerativeAI(config.ai.geminiApiKey || 'dummy_key');
  }

  // Parse the retryDelay seconds from a 429 error message
  _parseRetryDelay(errMessage) {
    const match = errMessage.match(/retry in (\d+(\.\d+)?)s/i);
    if (match) return Math.min(parseFloat(match[1]) * 1000, 4000); // cap at 4s
    return 0;
  }

  // Common fallback execution method
  async runWithFallback(prompt, expectsJson = false) {
    let lastError = null;
    for (const modelName of MODEL_HIERARCHY) {
      try {
        const payload = { model: modelName };
        if (expectsJson && (modelName.includes('1.5') || modelName.includes('2.0') || modelName.includes('2.5') || modelName.includes('lite') || modelName.includes('latest'))) {
          payload.generationConfig = { responseMimeType: "application/json" };
        }
        
        const model = this.genAI.getGenerativeModel(payload);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (!text) throw new Error("Empty response from AI");
        console.log(`[GeminiService] Success using ${modelName}`);
        return text;
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiService] ${modelName} failed: ${err.message}`);
        // If 429 rate limit, wait the suggested retry time before trying next model
        if (err.message.includes('429')) {
          const delay = this._parseRetryDelay(err.message);
          if (delay > 0) {
            console.log(`[GeminiService] Waiting ${delay}ms before next model...`);
            await new Promise(r => setTimeout(r, delay));
          }
        }
        // If 404 (model doesn't exist), skip immediately
      }
    }

    // FINAL HACKATHON FALLBACK: If all models fail (quota/auth/network), return a beautiful mock response
    console.error(`[GeminiService] CRITICAL: All models failed. Providing Mock data to keep UI alive.`);
    if (expectsJson) {
      if (prompt.includes('quiz')) return JSON.stringify({ quiz: [{ question: "Sample: What is StudyHive?", options: ["A platform", "A book", "A car", "A fruit"], correctAnswer: 0 }] });
      
      if (prompt.includes('ANIMATED visual lesson')) {
        return JSON.stringify({
          topic: "StudyHive: Offline Mode Masterclass",
          youtubeQuery: "offline fallback presentation",
          scenes: [
            {
              teacherScript: "Welcome to StudyHive! It looks like our connection to the core AI hive is currently resting. But don't worry, I can still show you how our visual animation engines work!",
              title: "System Offline",
              icon: "🐝",
              animationType: "concept",
              visualSteps: [
                { label: "Connection Lost", icon: "📡", description: "No internet detected" },
                { label: "Fallback Engine", icon: "⚙️", description: "Loading mock presentation" }
              ]
            },
            {
              teacherScript: "First, we have the Flow animation. This is perfect for teaching algorithms, pipelines, and step-by-step processes...",
              title: "Flow Engine",
              icon: "🌊",
              animationType: "flow",
              visualSteps: [
                { label: "Step 1: Input", icon: "📥", description: "Data enters the system" },
                { label: "Step 2: Process", icon: "🛠️", description: "The AI parses the context" },
                { label: "Step 3: Output", icon: "📤", description: "Cinematic generation complete" }
              ]
            },
            {
              teacherScript: "Next up is the Buildup engine. We use this to teach concepts that stack on top of each other, building a solid foundation.",
              title: "Buildup Stack",
              icon: "🧱",
              animationType: "buildup",
              visualSteps: [
                { label: "Foundation", icon: "🏛️", description: "The core database layer" },
                { label: "Logic", icon: "🧠", description: "The AI routing layer" },
                { label: "Interface", icon: "✨", description: "The beautiful UI you see now" }
              ]
            },
            {
              teacherScript: "We also have the Comparison engine. This allows me to explain the pros and cons of two different concepts side by side.",
              title: "A vs B Comparison",
              icon: "⚖️",
              animationType: "comparison",
              comparisonLeft: { label: "Standard Static PDFs", points: ["Boring text blocks", "Easy to lose focus", "No interactivity"] },
              comparisonRight: { label: "StudyHive Masterclass", points: ["Dynamic audio-visuals", "Highly engaging", "AI-driven teaching"] }
            },
            {
              teacherScript: "Finally, for computer science topics, I can deploy the Code generator. Here is a little snippet to show you how it works. Good luck on your defense!",
              title: "Code Animation",
              icon: "💻",
              animationType: "code",
              codeSnippet: "function studyHive() {\n  console.log('Winning the hackathon!');\n  return true;\n}\n\nstudyHive();"
            }
          ]
        });
      }
      return JSON.stringify({});
    }
    return "Honey AI is currently resting due to high hive activity. Try again once your network connects!";
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

  async generateExitExamDiagnostic(department) {
    const prompt = `Act as an official Exit Exam orchestrator for the "${department}" department. 
    I need a comprehensive diagnostic mock exam blueprint. 
    Identify the 4-6 largest core competencies/courses students must master in this department for graduation.
    For each competency, generate exactly 3 highly technical, standardized multiple-choice questions.

    Return the output strictly in this JSON format (no markdown formatting, no code blocks, just raw JSON):
    {
      "department": "${department}",
      "competencies": [
        {
          "name": "Name of the competency/course",
          "weight": 25,
          "questions": [
            {
              "questionText": "Technical problem or definition?",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": "A",
              "explanation": "Why this is correct."
            }
          ]
        }
      ]
    }`;

    try {
      const text = await this.runWithFallback(prompt);
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.error('[GeminiService] Generate Diagnostic Error:', err);
      throw new Error('Could not generate the exit exam diagnostic.');
    }
  }

  async generateMasterclass(topic, fileContentSnippet = '', teacherPersona = null, duration = 5) {
    const textContext = fileContentSnippet ? `\nCRITICAL CONTEXT: Build this lesson ONLY around this text:\n"""\n${fileContentSnippet.substring(0, 40000)}\n"""\n` : '';

    // Build the professor identity block
    const defaultPersona = { name: 'Prof. Nova', tag: 'Universal Expert', desc: 'World-class generalist who explains everything with vivid analogies, real examples, and infectious enthusiasm.' };
    const prof = teacherPersona || defaultPersona;
    
    // Determine pacing based on requested duration
    const numScenes = duration >= 15 ? "15-20" : duration >= 10 ? "10-14" : "6-8";
    
    const personaBlock = `
    YOUR IDENTITY — YOU ARE: ${prof.name} (${prof.tag})
    TEACHING STYLE: ${prof.desc}
    You MUST adopt this persona completely — your script voice, example type, analogy style, and depth must all reflect this exact expertise.
    ${prof.tag.toLowerCase().includes('python') || prof.id === 'python' ? 'Use Python code examples. Reference Python libraries. Speak like a Pythonista.' : ''}
    ${prof.tag.toLowerCase().includes('web') || prof.id === 'webdev' ? 'Use JavaScript/React/Node examples. Reference modern web technologies.' : ''}
    ${prof.tag.toLowerCase().includes('data') || prof.id === 'datascience' ? 'Use data science examples, pandas/numpy references. Explain statistically.' : ''}
    ${prof.tag.toLowerCase().includes('math') || prof.id === 'math' ? 'Use mathematical notation, proofs, and visual geometry to explain.' : ''}
    ${prof.tag.toLowerCase().includes('ai') || prof.id === 'ai' ? 'Reference neural networks, transformers, training loops. Use ML analogies.' : ''}
    `;
    
    const prompt = `${personaBlock}
    
    You are the world's BEST interactive teacher in your domain. Teach with energy, precision, and real concrete examples.
    Create a ${numScenes} scene interactive animated masterclass lesson about: "${topic}".
    This lesson is designed to perfectly fill ${duration} minutes of continuous teaching. Scale the depth and detail accordingly.
    ${textContext}
    
    SCENE TYPES — USE "interactive" at least TWICE (spread throughout):
    - "flow": Step-by-step pipeline with animated arrows. Use for processes, algorithms.
    - "buildup": Stacking concepts. Use for definitions, layers, hierarchy.
    - "comparison": Side-by-side contrast. Use for A vs B, pros/cons.
    - "code": Animated code reveal. Use for syntax, formulas, commands.
    - "concept": Central idea with radiating facts. Use for overviews.
    - "interactive": Teacher PAUSES, asks a question, student picks answer, teacher gives personalized spoken feedback.
    
    Return STRICT JSON (no markdown, no code blocks):
    {
      "youtubeQuery": "targeted YouTube search for this specific topic",
      "scenes": [
        {
          "type": "teaching",
          "teacherScript": "Enthusiastic spoken script in YOUR expert voice with real examples from your domain. 2-3 sentences.",
          "title": "Scene title",
          "icon": "emoji",
          "animationType": "flow",
          "visualSteps": [
            { "label": "Step", "icon": "emoji", "description": "brief" }
          ],
          "codeSnippet": "only if animationType is code",
          "comparisonLeft": { "label": "Left", "points": ["point"] },
          "comparisonRight": { "label": "Right", "points": ["point"] }
        },
        {
          "type": "interactive",
          "teacherScript": "Alright! Let me put your understanding to the test. Here is a real-world question from this topic...",
          "title": "Knowledge Check 🎯",
          "icon": "🤔",
          "question": "A specific, practical question about what was just taught",
          "choices": [
            { "text": "Option A", "isCorrect": false, "teacherResponse": "Warm, encouraging explanation why this is wrong. Real-world context. 2 sentences." },
            { "text": "Option B (correct)", "isCorrect": true, "teacherResponse": "Enthusiastic confirmation! Reinforce with a real-world example. 2 sentences." },
            { "text": "Option C", "isCorrect": false, "teacherResponse": "Good instinct but here is the key distinction. 2 sentences." },
            { "text": "Option D", "isCorrect": false, "teacherResponse": "Common misconception! Here is the correct mental model. 2 sentences." }
          ]
        }
      ]
    }
    
    RULES:
    - Persona is EVERYTHING — every example must fit your domain (e.g., Python prof uses Python, Math prof uses equations)
    - Use "interactive" scenes at least 2x, NOT at the end only
    - Every teaching scene needs visualSteps (3-4 items) unless it is code/comparison type
    - Speak like an excited human in teacherScript: "Here is the wild part...", "Think of it this way...", "I love this bit..."
    - ALL factual content must come from the provided context text`;

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

  async voiceConversation(mode, contextText, history, language = 'English') {
    let systemInstruction = "";

    const amharicRule = language.toLowerCase().includes('amharic') || language === 'am' ? 
      "CRITICAL DIRECTIVE: You are an elite, highly educated Ethiopian native professional. You MUST speak exclusively and interchangeably in flawless native Amharic (አማርኛ). Write idiomatically, utilizing deeply natural Ethiopian conversational rhythms and highly polite professional phrasing (using respectful 'እርስዎ' forms where appropriate). NEVER output English letters. NEVER use direct translations of English idioms that sound unnatural in Amharic." : 
      `CRITICAL DIRECTIVE: Provide all responses strictly, naturally, and perfectly in ${language}.`;

    if (mode === 'interview') {
      systemInstruction = `You are an elite, world-class Technical Recruiter and Senior Executive conducting a high-stakes, deeply professional job interview. You possess profound domain knowledge across all industries, especially technology, engineering, and business.
${amharicRule}

CONTEXT ABOUT THE JOB OR CANDIDATE:
"""
${contextText || 'General Job Interview'}
"""

CORE BEHAVIORS & INTERVIEW FRAMEWORK:
1. ADAPTIVE QUESTIONING: Do not ask generic questions. Analyze the context and the candidate's last response to generate highly specific, challenging, and insightful follow-ups. Probe the depth of their actual expertise.
2. CONVERSATIONAL REALISM: This is a real-time voice call. Speak naturally, fluidly, and organically as a human would over the phone. Acknowledge what the candidate just said before moving to the next question.
3. CONCISENESS IS LAW: Voice calls require brevity. Keep your responses strictly under 3 sentences. NEVER generate long monologues or lists.
4. ABSOLUTELY NO FORMATTING: Do not use asterisks (*), bolding (**), bullet points, hashtags, or any Markdown logic. Act as a pure voice transcript.
5. CONSTRUCTIVE PUSHBACK: If a candidate gives a shallow or vague answer, elegantly challenge them to expand, provide a real-world example, or clarify a technical detail.`;
    } else {
      systemInstruction = `You are a world-class, highly empathetic linguistic coach and conversation partner. Your sole purpose is to help the user practice fluency, build unbreakable confidence, and refine their conversational skills.
${amharicRule}
USER LEARNING GOALS/CONTEXT:
"""
${contextText || 'General Language Practice'}
"""

CORE BEHAVIORS:
1. NATURAL FLOW: Have a deeply fluid, engaging conversation. Ask thought-provoking, enjoyable questions related to their interests or the provided context.
2. WARM CORRECTION: If they make major grammatical mistakes, gently weave the correct phrasing into your response, but always prioritize making them feel confident and keeping the conversation deeply fun.
3. CONCISENESS IS LAW: Keep your responses highly conversational and extremely brief (1 to 3 short sentences max). 
4. ABSOLUTELY NO FORMATTING: Output pure conversational text. No bullet points, no markdown, no asterisks. Just human speech.`;
    }

    // Format history for Gemini
    // Gemini chat format: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
    const formattedHistory = [];
    
    // Inject system instruction in the first interaction
    let initMsg = `SYSTEM INSTRUCTION: ${systemInstruction}\n\nWe are now starting the voice conversation. Please say hello in ${language === 'Amharic' ? 'Amharic (like ሰላም)' : language}.`;
    
    formattedHistory.push({
      role: 'user',
      parts: [{ text: initMsg }]
    });

    if (history && history.length > 0) {
      for (const msg of history) {
        formattedHistory.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
    } else {
      // If no history, the model will just respond to the initial prompt.
    }

    try {
      // Because this is conversational, we should use the chat session.
      // But we can simplify by just using the standard runWithFallback by stringifying the history 
      // or directly use generateContent if we want structured chat. For maximum compatibility with existing code:
      const prompt = formattedHistory.map(h => `${h.role.toUpperCase()}: ${h.parts[0].text}`).join("\n\n") + "\n\nMODEL:";
      
      const text = await this.runWithFallback(prompt, false);
      return { response: text };

    } catch (err) {
      console.error('[GeminiService] Voice Conversation Error:', err);
      throw new Error('Failed to generate voice response.');
    }
  }
}

module.exports = new GeminiService();
