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
