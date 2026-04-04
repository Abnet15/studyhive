<div align="center">
  <img src="https://img.icons8.com/nolan/256/bee.png" alt="StudyHive Logo" width="128" height="128">

  # StudyHive 🐝
  
  **Transforming static University materials into an interactive, voice-driven AI Knowledge Base.**

  [![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Google Gemini](https://img.shields.io/badge/Gemini_2.5-AI_Engine-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](#)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animations-BB4BF6?style=for-the-badge&logo=framer&logoColor=white)](#)
  [![Speech API](https://img.shields.io/badge/Web_Speech-TTS_%26_STT-FF6F61?style=for-the-badge)](#)
  
  *Built with ❤️ by **Bekalu Temesgen** & **Abnet Sisay***
</div>

---

## 🚀 The Problem

Modern university portals and student group chats are suffering from the **"Google Drive Problem."** Students upload thousands of static lecture slides, PDFs, and generic documents. Finding specific information requires opening every single file. There is no interactivity, no guidance, and no mathematical mapping between files. Learning from long academic texts is isolating, boring, and highly inefficient.

## 💡 The Solution

**StudyHive** is not just another file repository — it is a **Smart Knowledge Hub**.

Powered by **Honey AI** (our highly customized Google Gemini 2.5 generative engine), StudyHive reads, understands, and semantically indexes every document uploaded. It organically converts static slides and dense PDFs into gamified achievements, native-speaking voice interviewers, AI-powered exit exam simulators, and animated virtual masterclasses.

---

## 🌟 Core AI-Powered Features

### 1. 🎤 Honey Interviewer — Voice-to-Voice AI Simulation
A fully real-time **Voice-to-Voice AI Loop** that acts as your personal recruiter or conversation partner:
- **Real-time Speech Recognition** — Speak naturally via your microphone; the system transcribes and feeds context to Honey AI instantly.
- **Multi-lingual Output (5 Languages)** — English, **Amharic (አማርኛ)**, French, Spanish, and German. We engineered "Elite Mode" prompt architectures to mandate idiomatically perfect native speech, mapped to regional Web Speech TTS voices.
- **Two Modes** — *Job Interview Prep* (upload a Job Description and the AI morphs into the Hiring Manager) and *English Practice* (casual conversational AI partner with grammar feedback).
- **Context-Aware File Memory** — Upload `.pdf`, `.docx`, or `.pptx` files and the AI reads and uses them as interview context.

### 2. 🎬 Honey Teacher — Cinematic AI Masterclass
Click **Start Masterclass** and the document is transformed into a fully cinematic lesson:
- **Audio Synthesis** — A custom script is spoken out loud by browser TTS with adjustable speed and voice selection.
- **5-Engine Animation System** — The AI picks the best visual layout per concept: **Flow Pipeline** (arrows), **Buildup Foundation** (stacking blocks), **Comparative Analysis** (dual columns), **Code Snippet Window**, or **Radiating Concept Hub**.
- **Karaoke Subtitles & Waveforms** — Audio waveforms pulse to the voice. Glowing subtitles highlight the spoken words in real-time.
- **Interactive Knowledge Checks** — The teacher pauses mid-lesson to quiz the student with immediate spoken feedback.
- **6 Built-in Professor Personas** — Pick from Python Expert, Web Dev Guru, Data Scientist, Math Wizard, AI Researcher, or Universal Expert. Each persona affects teaching style, analogies, and code examples.

### 3. 🎓 Exit Exam Preparation Hub *(NEW)*
A comprehensive AI-powered diagnostic exam simulator designed for **Ethiopian university exit exams (MoE)**:
- **12 University Departments** — Computer Science, Software Engineering, IT, Electrical Engineering, Medicine, Law, and more.
- **AI-Generated Diagnostic** — Honey AI builds a structured exam covering 4-6 core competencies per department with 15+ multiple-choice questions.
- **Timed Test Engine** — Full-screen, distraction-free exam environment with a live countdown timer, instant correct/wrong feedback, and detailed explanations for every answer.
- **Recharts Radar Chart Results** — A beautiful interactive radar chart visually maps competency strengths and weaknesses. Animated progress bars and letter grades per subject area.
- **Score Persistence** — Results are saved to MongoDB for historical tracking.

### 4. 🛡️ AI Quality Gate — Content Validation Engine
StudyHive completely eliminates platform spam:
- During upload, Honey AI extracts raw binary text from **PDFs** (`pdf-parse`), **DOCX** (`mammoth`), and **PPTX** (`officeparser`) files.
- The AI mathematically analyzes the content. Empty, corrupted, or irrelevant files are **instantly rejected** before entering the database.
- All uploaded materials receive AI-generated **summaries**, **key topics**, and **difficulty ratings** stored as searchable metadata.

### 5. 📝 Content-Derived AI Quizzes
Zero hallucinations guaranteed:
- Honey AI's strict prompt architecture generates multiple-choice quizzes mapped **1:1 against the raw extracted file text**.
- If the document doesn't explicitly state the answer, the AI cannot ask the question.
- Students receive instant scoring with detailed explanations.

### 6. 🧭 Hyper-Personalized Learning Pathways
The **AI Assistant Console** doesn't just guess what you want:
- It securely scans your MongoDB **Bookmarks** and **Recent Materials**.
- It extracts the underlying academic topics you've been focusing on.
- It structures a highly specific, tailored learning pathway unique to your current curriculum.

---

## 📚 Complete Platform Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token management.
- **Role-Based Access Control (RBAC)** — Student, Admin.
- Persistent login sessions with automatic token refresh.

### 📊 Student Dashboard
- **Real-time Statistics** — Total uploads, average rating, download count with animated counters.
- **Study Pulse Heatmap** — GitHub-style contribution graph showing daily academic activity.
- **Top Achievements System** — Earn gamified badges ("First Upload", "Scholar", "Helpful Contributor") with premium Framer Motion animations and unlock indicators.
- **Course Navigator** — Quick-access sidebar to jump into active courses.
- **AI Insights Widget** — Personalized recommendations powered by Honey AI.

### 🔍 Global Command-K Search
- A **lightning-fast, keyboard-driven search palette** (⌘K / Ctrl+K).
- Instantly searches across courses, topics, and specific academic materials.
- Filterable by material type, course, department.

### 📖 Course & Material Explorer
- **Department-based Organization** — Materials grouped by university departments and courses.
- **Rich Material Cards** — Download count, star ratings, file type badges, uploader info.
- **Bookmark System** — Save materials for later; bookmarks feed into AI personalization.
- **Rating & Review System** — 5-star ratings with written reviews on every material.
- **One-click Download** with Cloudinary-powered secure file serving.

### 📤 Smart Upload System
- **Drag & Drop Upload** with real-time progress indicators.
- Supports **PDF, DOCX, PPTX, PPT, TXT** files.
- **AI-Powered Auto-Tagging** — Honey AI extracts summary, key terms, difficulty level, and topic tags automatically.
- **Cloudinary Integration** — Files are securely stored in the cloud with optimized delivery.

### 👤 User Profile & Settings
- **Editable Profile** — Name, department, academic year, bio with avatar.
- **Upload History** with performance analytics.
- **Appearance Settings** — Dark/Light mode toggle with smooth Framer Motion transitions.
- **Account Management** — Password change, notification preferences.

### 🛡️ Admin Portal
- **Content Moderation Dashboard** — Review, approve, or reject uploaded materials.
- **User Management** — View all registered users, manage roles.
- **System Announcements Engine** — Broadcast real-time push notifications with priority levels (info, warning, critical) to targeted users.
- **Platform Analytics** — Upload stats, user engagement metrics.

### 🌙 Responsive Dark/Light Theming
- Full application-wide theme support using Tailwind CSS dark mode utilities.
- Seamless transitions with persistent user preference storage.
- Every page (including immersive Honey Studio pages) adapts perfectly to both themes.

### 🏠 Landing Page
- **Premium marketing page** with animated hero section, feature showcases, and social proof.
- Smooth scroll animations powered by Framer Motion.
- Mobile-responsive design.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React.js 18** | Component-based SPA architecture |
| **Framer Motion** | Cinematic physics-based animations |
| **Tailwind CSS v3** | Utility-first styling with dark/light theming |
| **TanStack React Query** | Server state management & optimistic updates |
| **Recharts** | Radar charts for Exit Exam analytics |
| **React Router v7** | Client-side navigation & protected routes |
| **Lucide React** | High-fidelity vector icon system |
| **Web Speech API** | Browser-native STT (Speech Recognition) & TTS (Speech Synthesis) |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js & Express** | RESTful API server |
| **Google Gemini SDK** | Generative AI engine (`gemini-2.5-flash`) |
| **Mongoose & MongoDB** | NoSQL data persistence with compound text indexes |
| **Cloudinary + Multer** | Cloud file storage with multipart form uploads |
| **PDF-Parse** | PDF binary text extraction |
| **Mammoth** | DOCX binary text extraction |
| **OfficeParser** | PPTX/PPT binary text extraction |
| **JWT + bcrypt** | Authentication & password hashing |

---

## 🏗️ Project Structure

```
studyhive/
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── pages/               # 16 full pages
│   │   │   ├── Landing.jsx          # Marketing landing page
│   │   │   ├── Dashboard.jsx        # Student dashboard with widgets
│   │   │   ├── CourseExplorer.jsx    # Course & material browser
│   │   │   ├── MaterialDetail.jsx   # Individual material view + reviews
│   │   │   ├── AIAssistant.jsx      # Honey AI console (quizzes, analysis, chat)
│   │   │   ├── HoneyTeacher.jsx     # AI Masterclass setup
│   │   │   ├── MasterclassPlayer.jsx# Cinematic lesson player
│   │   │   ├── HoneyInterviewer.jsx # Voice interview simulator
│   │   │   ├── ExitExamHub.jsx      # Exit exam diagnostic engine
│   │   │   ├── Admin.jsx            # Admin moderation portal
│   │   │   ├── Profile.jsx          # User profile page
│   │   │   ├── Settings.jsx         # User preferences
│   │   │   └── ...
│   │   ├── components/          # 10 reusable components
│   │   │   ├── Navbar.jsx           # Global navigation with AI dropdown
│   │   │   ├── GlobalSearch.jsx     # Command-K search palette
│   │   │   ├── Badge.jsx            # Achievement badge cards
│   │   │   ├── StudyPulse.jsx       # Activity heatmap
│   │   │   ├── UploadForm.jsx       # Smart upload with AI validation
│   │   │   └── ...
│   │   └── context/             # Auth, Theme, Material, Course providers
│   └── package.json
├── backend/                     # Express API
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── models/              # 8 Mongoose schemas
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Gemini AI service layer
│   │   ├── middleware/          # Auth, upload, error handling
│   │   └── utils/               # File extraction utilities
│   └── package.json
├── .github/workflows/ci-cd.yml # GitHub Actions CI/CD pipeline
├── package.json                 # Root concurrent runner
└── README.md
```

---

## 💻 Getting Started

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** (Local or Atlas)
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/))
- **Cloudinary Account** ([Sign up free](https://cloudinary.com/))

### 2. Environment Setup
Create a `.env` file inside the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_ai_studio_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Install & Run
From the **root** directory:
```bash
# Install ALL dependencies (frontend + backend)
npm run install:all

# Start both servers concurrently (Backend: 5000 | Frontend: 5173)
npm run dev
```

Or run them separately:
```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

---

## 👥 Authors

<table>
  <tr>
    <td align="center"><b>Bekalu Temesgen</b><br>Full-Stack Developer</td>
    <td align="center"><b>Abnet Sisay</b><br>Full-Stack Developer</td>
  </tr>
</table>

---

<div align="center">
  <i>Built to change the way university students interact with knowledge.</i><br><br>
  <b>🐝 StudyHive — Where Knowledge Comes Alive.</b>
</div>
