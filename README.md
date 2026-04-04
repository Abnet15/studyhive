<div align="center">
  <img src="https://img.icons8.com/nolan/256/bee.png" alt="StudyHive Logo" width="128" height="128">

  # StudyHive 🐝
  
  **The AI-Powered University Knowledge Platform That Turns Static Documents Into Interactive, Animated Learning Experiences.**

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

University students drown in thousands of static PDFs, lecture slides, and documents scattered across Google Drive and Telegram groups. Finding specific information means opening every file manually. There is **zero interactivity**, no intelligent guidance, and no way to truly *learn* from these materials — just passive reading.

## 💡 The Solution

**StudyHive** transforms every uploaded document into a **living, interactive AI-powered learning experience**.

Powered by **Honey AI** — our deeply customized Google Gemini 2.5 generative engine — StudyHive doesn't just store files. It **reads**, **understands**, and **teaches** them. Upload a dense 200-page PDF and within seconds, Honey AI extracts every concept, generates quizzes, builds animated masterclasses with virtual professors, simulates job interviews using the content, and maps your learning progress — all automatically.

---

## 🌟 Core AI-Powered Features

### 1. 🎬 Honey Teacher — Cinematic AI Masterclass Engine

The crown jewel of StudyHive. Click **Start Masterclass** on any uploaded material and it transforms into a fully animated, interactive lesson taught by a virtual AI professor:

- **8 Expert Professor Personas** — Choose from Prof. Stack (Web Dev), Dr. Pythia (Python), Prof. Sigma (Data Science), Dr. Euler (Mathematics), Dr. Synapse (AI/ML), Prof. Brew (Java), Dr. Cipher (Cybersecurity), or create your own custom professor with any specialty.
- **Mandatory Curriculum Coverage** — The AI reads ALL extracted key terms from the document and is **forced** to teach every single one. A material with 20 terms like "Node.js, Express, MongoDB, JWT, Bcrypt" will generate enough scenes to deeply cover all 20 concepts.
- **Dynamic Teaching Duration** — Students select 5, 10, or 15 minutes of teaching time. The AI dynamically scales the lesson depth and number of scenes accordingly (6-8 scenes for 5 min, up to 20+ scenes for 15 min).
- **5-Engine Animation System** — Each scene uses the optimal visual layout:
  - 🔄 **Flow Pipeline** — Step-by-step processes with animated arrows
  - 🧱 **Buildup Foundation** — Stacking concept layers with gradient connectors
  - ⚖️ **Comparative Analysis** — Side-by-side dual-column comparison with color-coded points
  - 💻 **Code Snippet Window** — Line-by-line animated code reveal with syntax highlighting and line numbers
  - 💡 **Radiating Concept Hub** — Central idea with spring-animated fact cards in a 2-column grid
- **Audio Narration + Karaoke Subtitles** — The professor speaks each script aloud via browser TTS. Glowing karaoke-style subtitles highlight each word in real-time. Audio waveforms pulse to the voice.
- **Interactive Knowledge Checks** — The professor pauses mid-lesson to quiz the student with 4 multiple-choice options. Each answer triggers unique spoken feedback explaining why it's right or wrong.
- **Deep, World-Class Teaching** — Each scene's script is 5-8 sentences long with real-world analogies, industry references, and "aha moment" explanations — engineered to match the quality of the best TED Talks.

### 2. 🎤 Honey Interviewer — Voice-to-Voice AI Simulation

A fully real-time **Voice-to-Voice AI Loop** for interview preparation and language practice:

- **Real-time Speech Recognition** — Speak naturally via your microphone; the system transcribes and feeds context to Honey AI instantly.
- **Multi-lingual Output (5 Languages)** — English, **Amharic (አማርኛ)**, French, Spanish, and German with "Elite Mode" prompt architectures for idiomatically perfect native speech.
- **Two Modes** — *Job Interview Prep* (upload a Job Description and the AI becomes the Hiring Manager) and *English Practice* (conversational AI partner with grammar feedback).
- **Context-Aware File Memory** — Upload `.pdf`, `.docx`, or `.pptx` files and the AI reads and uses them as interview context.

### 3. 🎓 Exit Exam Preparation Hub

A comprehensive AI-powered diagnostic exam simulator designed for **Ethiopian university exit exams (MoE)**:

- **12 University Departments** — Computer Science, Software Engineering, IT, Electrical Engineering, Medicine, Law, and more.
- **AI-Generated Diagnostics** — Honey AI builds structured exams covering 4-6 core competencies per department with 15+ multiple-choice questions.
- **Timed Test Engine** — Full-screen, distraction-free environment with countdown timer, instant feedback, and detailed explanations.
- **Recharts Radar Chart Results** — Interactive radar chart mapping competency strengths and weaknesses with animated progress bars and letter grades.
- **Score Persistence** — Results saved to MongoDB for historical tracking.

### 4. 🛡️ AI Quality Gate — Intelligent Content Validation

StudyHive ensures only meaningful content enters the platform:

- **Triple-Layer Text Extraction** — Extracts text via `pdf-parse` (PDF), `mammoth` (DOCX), and `officeparser` (PPTX/PPT).
- **Gemini Vision OCR Fallback** — If standard extraction returns empty (scanned PDFs, image-based documents), StudyHive sends the raw file bytes to **Gemini's multimodal vision model** to read the visual content. Supports PNG, JPG, WebP, and scanned PDFs.
- **Strict Empty File Rejection** — Files with absolutely no readable content (even after Vision OCR) are rejected with a clear error — they never enter the database.
- **Archive Bypass** — `.zip`, `.rar`, `.tar`, `.gz` files are allowed through without text extraction since they are compressed containers.
- **Auto-Generated Metadata** — Every uploaded material receives AI-generated summaries, key terms, topic tags, and content-derived quizzes.

### 5. 📝 Content-Derived AI Quizzes

Zero hallucinations guaranteed:

- Honey AI's strict prompt architecture generates multiple-choice quizzes mapped **1:1 against the raw extracted file text**.
- A hallucination guard filters out any system-referencing or meta-questions.
- Students receive instant scoring with detailed explanations.

### 6. 🧭 Hyper-Personalized Learning Pathways

The **AI Assistant Console** securely scans your MongoDB bookmarks and recent materials, extracts the underlying academic topics you've been focusing on, and structures a highly specific, tailored learning pathway unique to your current curriculum.

---

## 📚 Complete Platform Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token management.
- **Role-Based Access Control (RBAC)** — Student, Admin.
- Persistent login sessions with automatic token refresh.

### 📊 Student Dashboard
- **Real-time Statistics** — Total uploads, average rating, download count with animated counters.
- **Study Pulse Heatmap** — GitHub-style contribution graph showing daily academic activity.
- **Top Achievements System** — Gamified badges ("First Upload", "Scholar", "Helpful Contributor") with premium Framer Motion animations.
- **AI Insights Widget** — Personalized recommendations powered by Honey AI.

### 🔍 Global Command-K Search
- A **lightning-fast, keyboard-driven search palette** (⌘K / Ctrl+K).
- Instantly searches across courses, topics, and specific academic materials.

### 📖 Course & Material Explorer
- **Department-based Organization** — Materials grouped by university departments and courses.
- **Rich Material Cards** — Download count, star ratings, file type badges, uploader info.
- **Bookmark System** — Save materials for later; bookmarks feed into AI personalization.
- **Rating & Review System** — 5-star ratings on every material.
- **One-click Download** with Cloudinary-powered secure file serving.

### 📤 Smart Upload System
- **Drag & Drop Upload** with real-time progress indicators.
- **10MB File Size Limit** with client-side validation and clear error messaging.
- Supports **PDF, DOCX, PPTX, PPT, TXT** and image files.
- **AI-Powered Auto-Tagging** — Honey AI extracts summary, key terms, and topic tags automatically.
- **Cloudinary Integration** — Files securely stored in the cloud.

### 👤 User Profile & Settings
- **Editable Profile** — Name, department, academic year, bio with avatar.
- **Appearance Settings** — Dark/Light mode toggle with smooth transitions.
- **Account Management** — Password change, notification preferences.

### 🛡️ Admin Portal
- **Content Moderation Dashboard** — Review, approve, or reject uploaded materials.
- **User Management** — View registered users, manage roles.
- **System Announcements Engine** — Broadcast push notifications with priority levels to targeted users.
- **Platform Analytics** — Upload stats, user engagement metrics.

### 🌙 Responsive Dark/Light Theming
- Full application-wide theme support with persistent user preference storage.
- Every page adapts perfectly to both themes with smooth Framer Motion transitions.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React.js 18** | Component-based SPA architecture |
| **Framer Motion** | Cinematic physics-based animations (spring, stagger, layout) |
| **Tailwind CSS v3** | Utility-first styling with dark/light theming |
| **TanStack React Query** | Server state management & optimistic updates |
| **Recharts** | Radar charts for Exit Exam analytics |
| **React Router v7** | Client-side navigation & protected routes |
| **Lucide React** | High-fidelity vector icon system |
| **Web Speech API** | Browser-native STT & TTS for voice features |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js & Express** | RESTful API server |
| **Google Gemini SDK** | Generative AI engine (`gemini-2.5-flash` with automatic fallback hierarchy) |
| **Gemini Vision** | Multimodal OCR for scanned documents and images |
| **Mongoose & MongoDB** | NoSQL data persistence with compound text indexes |
| **Cloudinary + Multer** | Cloud file storage with 10MB limit enforcement |
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
│   │   ├── pages/               # 16+ full pages
│   │   │   ├── Landing.jsx          # Marketing landing page
│   │   │   ├── Dashboard.jsx        # Student dashboard with widgets
│   │   │   ├── CourseExplorer.jsx    # Course & material browser
│   │   │   ├── MaterialDetail.jsx   # Material view + reviews + AI tabs
│   │   │   ├── AIAssistant.jsx      # Honey AI console
│   │   │   ├── HoneyTeacher.jsx     # AI Masterclass (topic-based)
│   │   │   ├── MasterclassPlayer.jsx# Cinematic lesson player (file-based)
│   │   │   ├── HoneyInterviewer.jsx # Voice interview simulator
│   │   │   ├── ExitExamHub.jsx      # Exit exam diagnostic engine
│   │   │   ├── Admin.jsx            # Admin moderation portal
│   │   │   ├── Profile.jsx          # User profile page
│   │   │   └── Settings.jsx         # User preferences
│   │   ├── components/          # 10+ reusable components
│   │   │   ├── Navbar.jsx           # Global navigation
│   │   │   ├── GlobalSearch.jsx     # Command-K search palette
│   │   │   ├── UploadForm.jsx       # Smart upload with AI validation
│   │   │   └── ...
│   │   └── context/             # Auth, Theme, Material, Course providers
│   └── package.json
├── backend/                     # Express API
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── models/              # 8+ Mongoose schemas
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Gemini AI service layer
│   │   ├── middleware/          # Auth, upload, error handling
│   │   └── utils/               # File extraction + Vision OCR utilities
│   └── package.json
├── package.json                 # Root concurrent runner
└── README.md
```

---

## 💻 Getting Started

### 1. Prerequisites
- **Node.js** v18+
- **MongoDB** (Local or [Atlas](https://www.mongodb.com/atlas))
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

## 🧠 AI Architecture Highlights

### Gemini Model Fallback Hierarchy
StudyHive never fails silently. If the primary model (`gemini-2.5-flash`) hits a rate limit or error, it automatically cascades through:
1. `gemini-2.5-flash` → 2. `gemini-2.0-flash` → 3. `gemini-1.5-flash` → 4. `gemini-pro-latest`

### Vision OCR Pipeline
For scanned documents and image-based PDFs:
```
Upload → Standard Text Extraction (pdf-parse/mammoth)
  ├── Text found? → Run AI Pipeline (summary, terms, quiz)
  └── Empty? → Send raw bytes to Gemini Vision (multimodal)
       ├── Vision extracted text? → Run AI Pipeline
       └── Still empty? → Reject file (400 Bad Request)
```

### Masterclass Generation Flow
```
Material Key Terms + File Content + Professor Persona + Duration
  → Mandatory Curriculum Injection (every term must be taught)
  → Dynamic Scene Scaling (6-20 scenes based on terms + duration)
  → Gemini generates structured JSON with typed scenes
  → Frontend renders with type-specific Framer Motion animations
  → TTS narrates + karaoke highlights + interactive quizzes
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
