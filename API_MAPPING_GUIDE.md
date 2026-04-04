# 🧠 StudyHive Ultimate Architecture & API Deep Dive

This document is an exhaustive, extremely deep technical breakdown of the StudyHive application architecture. It traces the exact flow of data from the React frontend, through the network layer, into the Express middlewares, through the AI and Database controllers, and back to the client.

If your evaluators ask deeply technical software engineering questions (e.g., "How do you handle binary parsing?", "What does your authentication middleware look like?", "How does the AI interface with MongoDB?"), this document holds the answers.

---

## 🏗 System Architecture Overview

StudyHive operates on a **MERN stack** enhanced with **Google Gemini 2.5 Flash** and **Cloudinary**.

1.  **Client Tier (React + Vite)**: Uses `tanstack/react-query` for server-state management, `react-router-dom` for client-side routing, and `framer-motion`/`tailwind` for rendering.
2.  **API Tier (Node.js + Express)**: A RESTful API built on Express. It uses specialized middleware chains for JWT validation (`requireAuth`), role-based access control (`requireAdmin`), schema validation (`express-validator`), and multipart form parsing (`multer`).
3.  **Intelligence Tier (Google Gemini)**: The `gemini.service.js` abstraction layer isolates all LLM prompt engineering, communicating with Google AI Studio via SDK.
4.  **Data Tier (MongoDB)**: Data is persisted using Mongoose ORM. Features like Search rely on Compound Text Indexes over the `Material` document.

---

## 🔐 1. Deep Dive: Authentication & Security Flow

### **`POST /api/auth/login`**
*   **Frontend Origin**: `frontend/src/pages/Login.jsx`
*   **Network Payload**: `{ "email": "x@x.com", "password": "abc" }`
*   **Middleware Pipeline**:
    1.  `[body('email').isEmail(), body('password').notEmpty()]` -> Validates field presence and types.
    2.  `validateRequest` -> Express-validator checks for errors; if found, returns **400 Bad Request**.
*   **Controller Logic (`auth.controller.js`)**:
    1.  Database Query: `User.findOne({ email }).select('+password')`. (Password is normally hidden from queries).
    2.  Security Check: Uses `bcrypt.compare()` to compare plaintext password with the salted hash in MongoDB.
    3.  Token Generation: Signs a JSON Web Token (`jwt.sign()`) containing `{ userId: user._id, role: user.role }`, expiring in 30 days.
*   **Response Payload**: `{ "token": "eyJ...", "user": { "id": "...", "name": "...", "role": "student" } }`
*   **Frontend Action**: `AuthContext.jsx` catches this payload, stores the token in `localStorage`, updates React Context state (`setUser()`), and triggers a redirect to `/dashboard`.

### **`GET /api/auth/me`**
*   **Frontend Origin**: `frontend/src/context/AuthContext.jsx` (Inside the `useEffect` initialization block)
*   **Middleware Pipeline**:
    1.  `requireAuth`: Extracts token from `Authorization: Bearer <token>` header, verifies the signature using `JWT_SECRET`, looks up the user using `token.userId`, and attaches it to `req.user`. If token is invalid/missing, returns **401 Unauthorized**.
*   **Controller Logic**: Simply returns the `req.user` object attached by the middleware.
*   **Frontend Action**: Resurrects the user's session without requiring them to type in their password on a hard browser refresh.

---

## 📦 2. Deep Dive: The Data Upload & Ingestion Pipeline

### **`POST /api/materials`**
This is the most complex standard endpoint in the system.
*   **Frontend Origin**: `frontend/src/components/UploadForm.jsx` (Drag-and-Drop Zone)
*   **Network Payload**: `multipart/form-data` containing the binary File and form fields (`title`, `courseId`).
*   **Middleware Pipeline**:
    1.  `requireAuth` -> Secures the route (populates `req.user`).
    2.  `upload.single('file')` -> Uses `multer` to intercept the binary stream and temporarily store the file in server memory (`req.file`).
    3.  `validateRequest` -> Ensures title and courseId are provided.
*   **Controller Logic (`material.controller.js`)**:
    1.  **Cloud Storage (Cloudinary)**: Uses `cloudinary.uploader.upload_stream` to pipe the memory buffer to Cloudinary servers. Returns a secure CDN URL.
    2.  **Binary Extraction**: Based on the mimetype, routes the file to:
        *   `.pdf` -> `pdf-parse`
        *   `.docx` -> `mammoth`
        *   `.pptx` -> `officeparser`
    3.  **AI Quality Gate (`analyzeDocument`)**: Sends the extracted raw text string to `gemini.service.js`. Gemini is prompted to analyze the text and return a strict JSON schema containing: `summary`, `difficulty_level`, `topic_tags`.
    4.  **Database Commit**: Creates a `new Material({ ... })` referencing the `uploader_id`, the `course_id`, the Cloudinary URL, and injecting the AI metadata directly into the document.
*   **Response Payload**: Returns the newly created Mongoose document object.
*   **Frontend Action**: Upload spinner hits 100%, a success `Toast` notification appears, and React Router redirects to the `/material/:id` detail page.

---

## 🧠 3. Deep Dive: Generative AI & The Honey Engine

### **`POST /api/ai/masterclass`**
*   **Frontend Origin**: `frontend/src/pages/MasterclassPlayer.jsx`
*   **Network Payload**: `{ "materialId": "64...", "topic": "Networking", "persona": "Professor Spark" }`
*   **Controller Logic (`ai.controller.js`)**:
    1.  Fetches the specific `Material` from MongoDB using the ID.
    2.  Extracts the `extractedText` field (which was saved during the upload pipeline).
    3.  Passes the raw text, topic, and persona to `gemini.service.js`.
*   **Gemini Service Logic (`generateMasterclassContent`)**:
    1.  Injects a massive "System Instruction" defining the persona's speaking tone, constraints, and JSON requirements.
    2.  Forces Gemini to read the document text and output a JSON array of `blocks`.
    3.  Each block contains `content` (what to speak) and an `animationType` (e.g., `flow`, `comparative`, `code`).
*   **Frontend Action**:
    1.  `MasterclassPlayer.jsx` loops over the AI's returned JSON array.
    2.  Uses the native browser **Web Speech API** (`window.speechSynthesis`) to speak the `block.content` text aloud.
    3.  Uses a `switch (block.animationType)` statement to dynamically render different Framer Motion React components natively on screen while the audio plays.

### **`GET /api/ai/diagnostic/:dept`** (The Exit Exam Engine)
*   **Frontend Origin**: `frontend/src/pages/ExitExamHub.jsx`
*   **Controller Logic**:
    1.  Takes the `:dept` param (e.g., "Computer Science").
    2.  Calls `gemini.service.js -> generateExitExamDiagnostic(dept)`.
    3.  The prompt bypasses the internal DB text and instead relies on Gemini's general knowledge base of Ethiopian MoE curriculum standards.
    4.  Gemini is strictly instructed to return a layout of: `[{ competency: "Database", questions: [{ questionText: "...", options: ["A", "B"], correctAnswer: "..." }] }]`.
*   **Frontend Action**:
    1.  Flattens the nested JSON array into a single `flatQuestions` array.
    2.  Initiates a `setInterval` timer (React `useEffect`) countdown based on question count.
    3.  Displays a controlled UI mapping user clicks to question indexes.

### **`POST /api/ai/diagnostic/analyze`**
*   **Frontend Origin**: `frontend/src/pages/ExitExamHub.jsx` (Triggered automatically when the timer hits zero or the student clicks "Finish").
*   **Network Payload**: `{ "department": "Computer Science", "scores": [{ "competency": "Database", "score": 3, "maxScore": 5 }], "totalScore": 7, "totalMaxScore": 10 }`
*   **Controller Logic**:
    1.  Takes the exact calculated scores from the frontend state.
    2.  DB Query: `ExamScore.create({ user_id: req.user._id, department, scores, totalScore, totalMaxScore })`.
*   **Frontend Action**: 
    1.  Fires up Recharts `<RadarChart>` feeding the `scores` array to the `data` prop.
    2.  Animates progress bars `style={{ width: \`\${(score/maxScore)*100}%\` }}`.

---

## 📊 4. Deep Dive: Dynamic Dashboards & Aggregations

### **`GET /api/dashboard/me`** (Student Dashboard)
*   **Frontend Origin**: `frontend/src/pages/Dashboard.jsx` (Initial mount `useEffect`).
*   **Middleware Pipeline**: `requireAuth` (Needs to know *which* student is requesting).
*   **Controller Logic (`dashboard.controller.js`)**:
    1.  `Material.find({ uploader_id: req.user._id })`.
    2.  Calculates exact upload size (`materials.length`).
    3.  Sums total download count natively inside Node arrays via `reduce`.
    4.  **Exit Readiness Calculation**: Query `ExamScore.findOne({ user_id: req.user._id }).sort({ createdAt: -1 })`. Grabs the *most recent* exam attempt and does the division calculation.
*   **Frontend Action**: React destructs this object and populates the Gamified Bento Grids, swapping out skeleton loaders for the real, hard numbers.

### **`GET /api/dashboard/summary`** (Admin Dashboard)
*   **Frontend Origin**: `frontend/src/pages/Admin.jsx` 
*   **Middleware Pipeline**: `requireAuth` -> `requireAdmin` (Checks if `req.user.role === 'admin'`. Rejects 403 Forbidden if not).
*   **Controller Logic (`dashboard.controller.js`)**:
    1.  Uses computationally aggressive **MongoDB Aggregation Pipelines**.
    2.  `Material.aggregate([{ $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }])` -> Orders the DB engine (not Node.js) to sum values across thousands of rows instantly.
    3.  Top Contributors Pipeline: `$group` by `uploader_id`, `$sort` descending, `$limit` 5, `$lookup` (Left Outer Join) to the `users` collection to pull their full name.
*   **Frontend Action**: Renders the absolute root metadata of the entire platform for administration.

---

## 🔍 Code Base Highlights for the Defense
If evaluators want to look at code, direct them to these 3 specific files. They contain the highest technical density:

1.  **`backend/src/services/gemini.service.js`:** The brain. Shows how you engineered LLM system prompts, forced JSON structural schemas, handled text constraints, and built fault-tolerance (try/catch parsing) around external AI APIs.
2.  **`backend/src/middleware/upload.js`:** The binary gatekeeper. Shows your understanding of `multer`, RAM buffering, and interacting with Cloudinary streams.
3.  **`frontend/src/pages/MasterclassPlayer.jsx`:** The UI powerhouse. Shows your mastery of React state machines, standardizing the Web Speech API (synthesizer syncing), and dynamic Framer Motion animations based on JSON keys.
