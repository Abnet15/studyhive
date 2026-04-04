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
    const prompt = `You are an expert academic advisor AI. Based on this student profile: ${JSON.stringify(userStats)},
    create a highly personalized 3-step study action plan for TODAY.
    
    Return ONLY a strict JSON object like this (no markdown, no code blocks):
    {
      "steps": [
        {
          "step": 1,
          "icon": "🎯",
          "title": "Short action title (max 6 words)",
          "description": "Concise, specific advice for this student (2 sentences max)",
          "tag": "Focus Area label",
          "priority": "high"
        },
        {
          "step": 2,
          "icon": "📚",
          "title": "Short action title (max 6 words)",
          "description": "Concise, specific advice for this student (2 sentences max)",
          "tag": "Focus Area label",
          "priority": "medium"
        },
        {
          "step": 3,
          "icon": "🚀",
          "title": "Short action title (max 6 words)",
          "description": "Concise, specific advice for this student (2 sentences max)",
          "tag": "Focus Area label",
          "priority": "low"
        }
      ],
      "motivationQuote": "A one-line motivational quote specific to their study topics."
    }
    
    Make the advice SPECIFIC to the topics: ${userStats.aiKnownTopics || 'general studies'}.`;

    try {
      const text = await this.runWithFallback(prompt, true);
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}') + 1;
      if (jsonStart === -1) throw new Error('No JSON found');
      const parsed = JSON.parse(text.substring(jsonStart, jsonEnd));
      return { steps: parsed.steps || [], motivationQuote: parsed.motivationQuote || '' };
    } catch (err) {
      console.error('[GeminiService] Recommendations Error:', err);
      // Fallback structured data so UI never breaks
      return {
        steps: [
          { step: 1, icon: '🎯', title: 'Review Your Core Materials', description: 'Revisit your most recent uploads and strengthen your understanding of key concepts.', tag: 'Deep Review', priority: 'high' },
          { step: 2, icon: '📝', title: 'Run a Practice Quiz', description: 'Use the Practice Arena below to test your knowledge on a topic you studied this week.', tag: 'Self-Testing', priority: 'medium' },
          { step: 3, icon: '🚀', title: 'Start a Masterclass Session', description: 'Upload a document and let AI teach you the full topic with animations and voice narration.', tag: 'AI Learning', priority: 'low' },
        ],
        motivationQuote: 'Every expert was once a beginner. Keep going! 🌟'
      };
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

  async generateMasterclass(topic, fileContentSnippet = '', teacherPersona = null, duration = 5, keyTerms = []) {
    const textContext = fileContentSnippet ? `\nCRITICAL CONTEXT: Build this lesson ONLY around this text:\n"""\n${fileContentSnippet.substring(0, 40000)}\n"""\n` : '';

    // Build the professor identity block
    const defaultPersona = { name: 'Prof. Nova', tag: 'Universal Expert', desc: 'World-class generalist who explains everything with vivid analogies, real examples, and infectious enthusiasm.' };
    const prof = teacherPersona || defaultPersona;
    
    // Determine pacing: scale scenes based on both duration AND number of key terms
    const termCount = keyTerms.length || 0;
    const minFromDuration = duration >= 15 ? 15 : duration >= 10 ? 10 : 6;
    const minFromTerms = Math.max(6, Math.ceil(termCount * 0.8)); // ~1 scene per term
    const sceneTarget = Math.max(minFromDuration, minFromTerms);
    const numScenes = `${sceneTarget}-${sceneTarget + 4}`;

    // Build mandatory curriculum from key terms
    const curriculumBlock = keyTerms.length > 0 ? `
    ═══════════════════════════════════════════════════════════════════
    MANDATORY CURRICULUM — YOU MUST TEACH EVERY SINGLE ONE OF THESE:
    ═══════════════════════════════════════════════════════════════════
    ${keyTerms.map((t, i) => `${i + 1}. ${t}`).join('\n    ')}
    
    Each term above MUST be covered in at least one scene. Group related terms into the same scene if they are closely connected (e.g., "Promises" and "Callbacks" can share a scene, "Express" and "REST API" can share a scene).
    Also add supplementary concepts that a student would NEED to understand these terms properly.
    DO NOT skip any term. If there are 20 terms, you need enough scenes to cover all 20.
    ` : '';
    
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
    
    You are the world's GREATEST interactive teacher — imagine the energy of the best TED Talk combined with the depth of an MIT lecture.
    Your job is to create a ${numScenes} scene interactive animated masterclass that teaches EVERY CORE CONCEPT in deep detail.
    Topic: "${topic}"
    Duration target: ${duration} minutes of dense, rich teaching.
    
    ${curriculumBlock}
    ${textContext}
    
    ═══════════════════════════════════════════════════════════════════
    ABSOLUTE RULES — VIOLATION = FAILURE:
    ═══════════════════════════════════════════════════════════════════
    
    1. TEACH THE ACTUAL CONTENT — NOT META-INFORMATION.
       ❌ NEVER generate scenes about: "file structure", "PDF bytes", "data types", "user requests", "how the system works", "recognizing formats".
       ✅ ONLY generate scenes that teach the REAL SUBJECT MATTER from the provided text.
       If the topic is "Node.js", teach event loops, modules, Express, streams, buffers, async/await, etc.
       If the topic is "React", teach components, hooks, state, props, JSX, virtual DOM, etc.
       
    2. DEPTH — Teach like the world's best professor:
       - Each teacherScript MUST be 5-8 rich sentences with real-world analogies, concrete examples, and "aha moment" explanations.
       - Explain the WHY behind every concept, not just the WHAT.
       - Use vivid metaphors: "Think of the event loop like a waiter in a restaurant — it takes orders, sends them to the kitchen, and serves other tables while waiting..."
       
    3. COVERAGE — Cover ALL major topics from the provided content:
       - Extract every distinct concept, technique, and principle mentioned in the file content.
       - Organize them into a logical learning progression: fundamentals first, advanced concepts later.
       - Each scene = one major concept taught thoroughly.
       
    4. ANIMATION VARIETY — Use ALL types for visual richness:
       - "flow": Step-by-step process with animated arrows (algorithms, lifecycles, pipelines)
       - "buildup": Stacking/layering concepts (definitions, architecture layers)
       - "comparison": Side-by-side A vs B (pros/cons, old vs new, sync vs async)
       - "code": Animated code reveal with syntax highlighting (actual working code examples)
       - "concept": Central idea with radiating facts (overviews, core principles)
       - "interactive": Quiz pause — teacher asks, student picks, teacher gives spoken feedback
       USE "interactive" at least 2 times, spread throughout the lesson (NOT at the end).
       
    5. TEACHER PERSONALITY — Be unforgettable:
       - Start scenes with hooks: "Here is what blew my mind when I first learned this..."
       - Use dramatic reveals: "And THIS is the secret sauce that makes it all work..."
       - Show genuine excitement: "I absolutely LOVE this concept because..."
       - Connect to real industry: "At Google, they use this exact pattern to handle..."

    Return STRICT JSON (no markdown, no code blocks, no commentary):
    {
      "youtubeQuery": "targeted YouTube search for this specific topic",
      "scenes": [
        {
          "type": "teaching",
          "teacherScript": "5-8 sentence passionate, deep explanation with analogies and real examples. Speak like a world-class lecturer.",
          "title": "Descriptive Scene Title About The Actual Concept",
          "icon": "relevant emoji",
          "animationType": "flow|buildup|comparison|code|concept",
          "visualSteps": [
            { "label": "Key Point Name", "icon": "emoji", "description": "1-2 sentence explanation of this specific point" }
          ],
          "codeSnippet": "actual working code example (only if animationType is code)",
          "comparisonLeft": { "label": "Side A", "points": ["point1", "point2", "point3"] },
          "comparisonRight": { "label": "Side B", "points": ["point1", "point2", "point3"] }
        },
        {
          "type": "interactive",
          "teacherScript": "Engaging setup for the quiz question, connecting it to what was just taught. 3-4 sentences.",
          "title": "Knowledge Check 🎯",
          "icon": "🤔",
          "question": "A specific, practical question testing real understanding of the concept just taught",
          "choices": [
            { "text": "Option A", "isCorrect": false, "teacherResponse": "Warm explanation why wrong + what the correct mental model is. 2-3 sentences." },
            { "text": "Option B (correct)", "isCorrect": true, "teacherResponse": "Enthusiastic confirmation with bonus insight or real-world example. 2-3 sentences." },
            { "text": "Option C", "isCorrect": false, "teacherResponse": "Good thinking but here is the key distinction most people miss. 2-3 sentences." },
            { "text": "Option D", "isCorrect": false, "teacherResponse": "Classic misconception! Here is the right way to think about it. 2-3 sentences." }
          ]
        }
      ]
    }
    
    FINAL CHECK: Every single scene title and teacherScript must be about the ACTUAL SUBJECT (${topic}), NOT about files, PDFs, uploads, data types, or system processing.`;

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
