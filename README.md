<div align="center">
  <img src="https://img.icons8.com/nolan/256/bee.png" alt="StudyHive Logo" width="128" height="128">

  # StudyHive 🐝
  
  **Transforming static University materials into an interactive, voice-driven AI Knowledge Base.**

  [![React](https://img.shields.io/badge/React-18.x-blue?style=flat&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=flat&logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-success?style=flat&logo=mongodb)](https://www.mongodb.com/)
  [![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI%20Engine-orange?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
  [![SpeechSynthesis](https://img.shields.io/badge/SpeechSynthesis-WebTTS-purple?style=flat)](#)
  
  *Built for the ultimate Hackathon experience.*
</div>

---

## 🚀 The Problem
Modern university portals and student group chats are suffering from the **"Google Drive Problem."** 
Students upload thousands of static lecture slides, PDFs, and generic documents. Finding specific information requires opening every single file. There is no interactivity, no guidance, and no mathematical mapping between files. Learning from long academic texts is isolating, boring, and highly inefficient.

## 💡 The Solution (StudyHive + Honey AI)
StudyHive is a **Smart Knowledge Hub**. 
Powered by **Honey AI** (our highly customized Gemini 2.5 generative engine), StudyHive reads, understands, and semantically indexes every document uploaded. It organically converts static slides and dense PDFs into gamified achievements, native-speaking voice interviewers, and animated virtual masterclasses.

---

## 🌟 The "Wow" Factor: Core Hackathon Features

### 1. 🎤 Honey Interviewer (Native-Voice Simulation)
Why just read when you can speak? We integrated a highly complex **Voice-to-Voice AI Loop** that acts as your personal recruiter or conversation partner:
- **Real-time Speech Recognition**: Speak naturally into your microphone and the system instantly transcribes and feeds the context into Honey AI.
- **Amharic & Multi-lingual Generative Output**: Honey AI dynamically speaks back to you. We even engineered "Elite Mode" prompt architectures to mandate idiomatically perfect **Amharic (አማርኛ)** output, mapped directly to regional Web Speech TTS voices.
- **Context-Aware Memory**: Upload a Job Description (`.docx`, `.pdf`, `.pptx`) and watch the AI morph into the Hiring Manager for that exact job.

### 2. 🎬 Honey Teacher (Cinematic Masterclass)
You don't have to read documents anymore. Clicking **Start AI Masterclass** launches an absolute cinematic experience:
- **Audio Synthesis:** A custom-generated, enthusiastic script is literally spoken out loud to the student.
- **5-Engine Animation System:** Framer Motion dynamically drives the UI based on the AI's mathematical decision logic. The AI determines whether to teach the concept using a **Flow pipeline** (arrows), a **Buildup Foundation** (stacking blocks), a **Comparative Analysis** (dual columns), a **Code snippet window**, or a **Radiating Concept Hub**.
- **Karaoke Subtitles & Waveforms:** Audio waveforms pulse to the voice while glowing subtitles highlight the spoken words in real-time.

### 3. 🧠 Smart Parsing & Presentation Support
Traditional uploaders only look at PDFs. StudyHive officially unpacks deeply nested binary structures. Whether a student uploads a 50-page PDF, a `.docx`, or an obscurely formatted **PowerPoint (`.pptx`/`.ppt`)** file, the backend cascade (using `officeparser` and `pdf-parse`) reliably isolates the raw text layer, mathematically validates it for spam prevention, and injects it into our MongoDB Compound Text Index.

### 4. 🏆 Gamified Productivity Dashboard
Learning should feel like leveling up. We built a beautiful glass-morphic student dashboard equipped with dynamically tracking widgets:
- **Real-time Study Pulse Heatmap**: Visualize your academic consistency and resource generation visually.
- **Top Achievements System**: Earn badges ("First Upload", "Scholar", "Helpful Contributor") through engagement. Designed with world-class, premium Framer Motion hover states, sleek gradients, and crisp typography to simulate high-end software usability.

### 5. 🛡️ The AI Quality Gate & Content-Derived Quizzes
No more meaningless platform spam, and no more LLM hallucinations. Honey AI strictly governs database ingestion and insists that uploaded files are genuinely academic. All generative Quizzes are mapped strictly 1:1 against the raw extracted file text—if the extracted PDF text doesn't explicitly state the answer, the AI cannot ask the question.

---

## 📚 Complete Platform Architecture
Beyond the AI integrations, StudyHive functions as a world-class production application:
* **JWT Authentication & RBAC**: Secure login flows with student-specific dashboards and an exclusive Admin Portal for moderation.
* **Global Command-K Search**: A lightning-fast, keyboard-driven global search palette that instantly fetches courses, topics, and specific academic materials across the app.
* **System Announcements Engine**: Admins can broadcast real-time, priority-colored Push Notifications directly to active users.
* **Course & Material Explorer**: A beautifully organized navigation hub that groups materials by university departments, allowing students to filter, bookmark, upvote, and download resources instantly.
* **Responsive Dark/Light Theming**: Full application support for user-preference themes, utilizing pristine Tailwind CSS design systems and Framer Motion layout transitions.

---

## 🛠️ Technology Stack

### Frontend (UI & Cinematic Animations)
- **React.js (v18)** - Component-based architecture.
- **Framer Motion** - Cinematic, high-performance UI physics and animations.
- **Tailwind CSS v3** - Complete global light/dark mode theming and glassmorphism UI.
- **Lucide React** - High-fidelity vector iconography.
- **React Router** - Navigation and context routing.
- **TanStack React Query** - Optimistic UI updates and robust caching.

### Backend (Server & Intelligence Engine)
- **Node.js & Express** - High-speed REST API routing.
- **Google Gemini SDK** - Advanced Generative LLM (`gemini-2.5-flash`).
- **Mongoose / MongoDB** - NoSQL Data persistence with Advanced Search Aggregations.
- **Cloudinary** - Secure multipart form uploading and cloud blob storage.
- **PDF-Parse, Mammoth & OfficeParser** - Complete raw binary extraction for PDFs, DOCXs, and PPTXs.

---

## 💻 Running the App Locally

Start the entire application (Frontend + Backend) with **ONE single command**.

### 1. Requirements
* Node.js (v18+)
* MongoDB instance (Local or Atlas)
* Google Gemini API Key
* Cloudinary Keys

### 2. Environmental Setup
Create a `.env` in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_ai_studio_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Build & Run
From the **root** folder, run these two commands:
```bash
# Installs packages for BOTH frontend and backend automatically
npm run install:all

# Fires up the concurrently runner (Backend: port 5000 | Frontend: port 5173)
npm run dev
```

---

<div align="center">
  <i>Built to change the way university students interact with knowledge.</i><br>
  <b>Good luck with the defense! You are going to crush it.</b>
</div>
