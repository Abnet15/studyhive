<div align="center">
  <img src="https://img.icons8.com/color/144/000000/bee.png" alt="StudyHive Logo">
  
  # StudyHive 🐝
  
  **Transforming static University materials into an intelligent, interactive AI Knowledge Base.**

  [![React](https://img.shields.io/badge/React-18.x-blue?style=flat&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=flat&logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-success?style=flat&logo=mongodb)](https://www.mongodb.com/)
  [![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Engine-orange?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
  
  *Built for the ultimate Hackathon experience.*
</div>

---

## 🚀 The Problem
Modern university portals and student group chats are suffering from the **"Google Drive Problem."** 
Students upload thousands of static PDFs, DOCXs, and slides. Finding specific information requires opening every single file. There is no interactivity, no guidance, and no way to guarantee if a file is actually educational or just random spam. Learning from long academic texts is isolating and boring.

## 💡 The Solution (StudyHive + Honey AI)
StudyHive isn't just another file repository. It is a **Smart Knowledge Hub**. 
Powered by **Honey AI** (our custom Gemini-driven intelligence engine), StudyHive reads, understands, and mathematically indexes every document uploaded. It turns a static 50-page PDF into an interactive tutor that knows you, guides you, and literally speaks to you.

---

## 🎯 Target Audience
* **University Students:** Wanting highly specific study guides, practice quizzes, and an easier way to digest dense academic text.
* **Peer Tutors / Top-Tier Students:** Sharing their comprehensive notes and ensuring quality control.
* **Educators:** Looking for a modern, engaging platform to distribute materials that students *actually* want to use.

---

## ✨ Core Features (The Hackathon "Wow" Factor)

### 1. 🛡️ The AI Quality Gate (Content Validation)
StudyHive completely eliminates platform spam. During the upload process, Honey AI extracts the raw binary text (supporting both PDFs and Microsoft Word DOCX formats) and mathematically analyzes it. If a user uploads an empty document, a corrupted file, or a file with completely irrelevant/inappropriate text, **the AI instantly rejects the database entry** and halts the upload.

### 2. 🧠 Smart Indexing & Deep Search
Traditional searches only look at filenames. StudyHive indexes the *soul* of the document. When a student uploads a file, Honey AI extracts a smart summary, key academic terms, and high-level structural topics. We bridge this extracted intelligence into a massive MongoDB Compound Text Index. A student can search for "Thermodynamics," and the engine will instantly surface a file titled "Physics 101" just because the AI knows it's inside!

### 3. 🎬 The Virtual Professor (Cinematic Masterclass)
This is the heart of StudyHive. You don't have to read documents anymore. Clicking **Start AI Masterclass** launches an absolute cinematic experience:
- **Audio Synthesis:** A custom-generated, enthusiastic script is literally spoken out loud to the student via browser Text-to-Speech engines.
- **5-Engine Animation System:** Framer Motion dynamically drives the UI based on the AI's internal logic. Honey AI determines whether to teach the concept using a **Flow pipeline** (arrows), a **Buildup Foundation** (stacking blocks), a **Comparative Analysis** (dual columns), a **Code snippet window**, or a **Radiating Concept Hub**.
- **Karaoke Subtitles & Waveforms:** Audio waveforms pulse to the voice while glowing subtitles highlight the spoken words in real-time.

### 4. 🧭 Hyper-Personalized Learning Journeys
Our AI Assistant doesn't just guess what you want. It securely scans your MongoDB **Bookmarks** and **Recent Materials**, extracts the underlying academic topics you have been focusing on, and structures a highly specific, tailored learning pathway unique to your current curriculum.

### 5. 📝 Content-Derived AI Quizzes
No hallucinations. Honey AI's strict prompt architecture forces it to map multiple-choice practice quizzes precisely 1:1 against the raw text of the document you uploaded. If the text doesn't explicitly state the answer, the AI cannot ask the question.

---

## 🛠️ Technology Stack

### Frontend (User Interface & Animations)
- **React.js (v18)** - Component-based architecture.
- **Framer Motion** - Cinematic, high-performance UI physics and animations.
- **Tailwind CSS** - Rapid, responsive styling and glassmorphism.
- **Lucide React** - SVG Iconography.
- **React Router (v7 compliant)** - Navigation and context routing.
- **TanStack React Query** - Optimistic UI updates and state management.

### Backend (Server & AI Processing)
- **Node.js & Express** - High-speed REST API routing.
- **Google Gemini SDK** - Advanced Generative LLM (`gemini-2.5-flash` primary).
- **Mongoose / MongoDB** - NoSQL Data persistence with Advanced Text Indexing.
- **Multer & Cloudinary** - Secure multipart form uploading and cloud blob storage.
- **PDF-Parse & Mammoth** - Raw binary Buffer extraction for PDFs and DOCXs.

---

## 🐝 Honey AI: The Fallback Architecture
Hackathon Wi-Fi is notoriously bad. StudyHive never goes offline.
We built a robust, deep fallback engine. If the primary API limits are hit, the backend cascades through 5 different Google-tier models. If the venue's TLS connection crashes entirely, the backend catches the network failure and securely injects an **Offline Mock Presentation**. This allows the Virtual Professor to continue working with a hardcoded script to show judges exactly how the 5 animation engines operate—ensuring the presentation is flawlessly impressive without internet.

---

## 💻 Getting Started (Local Development)

### 1. Requirements
* Node.js (v18+)
* MongoDB instance (Local or Atlas)
* Google Gemini API Key
* Cloudinary Keys

### 2. Environmental Variables (`.env`)
You will need to create a `.env` in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_ai_studio_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Installation
**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

<div align="center">
  <i>Built to change the way university students interact with knowledge.</i><br>
  <b>Good luck with the defense!</b>
</div>
