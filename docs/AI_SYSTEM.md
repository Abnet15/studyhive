# Askuala AI System Deep Dive 🧠

StudyHive is enhanced by a powerful fallback-based AI architecture specifically designed for the Edu-Tech sector. It analyzes raw course materials and returns actionable, structured JSON data.

## Core Component: `utils/ai.js`

### 1. Smart Extraction
When a user uploads a PDF or Document, **Cloudinary** securely hosts it. 
However, LLMs cannot natively parse PDF buffers over standard API calls. Our system bypasses this:
- It utilizes `axios` to download the specific file buffer directly from the Cloudinary CDN.
- It pipes the buffer through `pdf-parse`.
- It truncates the string to 100,000 characters to safely fit into extreme context windows without overflowing or causing unexpected billing surges.

### 2. Intelligent Model Fallback
The `generateWithFallback(prompt)` function is the brain of the operation. It iterates through Google's flagship models depending on availability and rate limits. 

```javascript
const MODEL_HIERARCHY = [
  'gemini-3.1-pro-preview',        // Top-tier logic
  'gemini-3.1-flash-lite-preview', // High-Speed fallback
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-pro-latest',
  'gemini-flash-latest'
];
```

If `gemini-3.1-pro-preview` throws a `503 Service Unavailable` or a Rate Limit Error, the system instantly logs a warning and attempts generation with `gemini-3.1-flash-lite-preview`. 

### 3. Structured JSON Generation
The prompt injected into the AI forces it to output strictly parsable JSON, omitting markdown blocks (e.g. ` ```json ` ). 

It generates:
- `aiSummary`: A concise text summary.
- `aiKeyTerms`: Top 5 terms for flashcards.
- `aiQuiz`: A fully formed Multiple Choice quiz array based on the lecture material.

These fields are then injected directly into the Mongoose `Material` document before saving.


## 🌟 Advanced AI Features (BiT AI Hackathon 2026)

StudyHive brings educational platforming to the next level by natively integrating deep AI capabilities aimed at completely reimagining how users consume and retain knowledge:

- **AI Assistant (Honey Hub)**: A context-aware chatbot and AI Swiss knife that supports document Q&A, quiz generation, automated course summarizations, and generating dynamic explanations based on uploaded material.
- **Honey Teacher (Virtual Tutor)**: A highly interactive, visually animated teaching assistant. It takes any topic and fully autonomously synthesizes a complete slide deck and animated "masterclass" presenting the content with different expert personas, utilizing Speech Synthesis and visually stunning Framer Motion workflows.
- **Honey Interviewer**: A mock-interview simulator tailored for software engineers and professionals. Conducts live voice-to-text behavioral and technical interviews, grading the user's responses, offering corrective explanations, and tracking metrics.
- **Honey Exit Indicator**: A rich dashboard dedicated to providing analytical probability on exit exam readiness, powered by AI extrapolation of the student's historical quiz, interview, and lesson performances.

