# 🧠 STUDYHIVE — MASTER CONTEXT DOCUMENT (v2.0)

> **AI INSTRUCTION:** This is the single source of truth for the entire StudyHive codebase. ANY AI agent or developer MUST read this file FIRST before making modifications. It documents every file, every schema, every route, every pattern, and every architectural decision. If something contradicts this file, THIS FILE wins.

---

## 1. PROJECT IDENTITY

| Field | Value |
|-------|-------|
| **Name** | StudyHive |
| **Purpose** | AI-Powered Edu-Tech Learning Hub |
| **Competition** | BiT AI Hackathon 2026 — Edu-Tech Track |
| **Spotlight** | Askuala Link (potential funding & partnership) |
| **Monorepo** | Yes — `backend/` + `frontend/` |
| **Value Prop** | Transforms static PDF/Doc uploads into AI-summarized learning materials with auto-generated quizzes and key terms |

---

## 2. TECH STACK (CURRENT — FINAL)

### Backend
| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js ≥ 18 | |
| Framework | Express 4.x | Entry: `backend/src/server.js` |
| Database | **MongoDB** via Mongoose 9.x | ⚠️ MySQL is REMOVED. Never use `mysql2` or raw SQL. |
| File Storage | **Cloudinary CDN** via `multer-storage-cloudinary` | ⚠️ Local `/uploads/` is FORBIDDEN. All files go to cloud. |
| AI Engine | Google Gemini via `@google/generative-ai` | With intelligent model fallback chain |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) | Bearer token in `Authorization` header |
| Validation | `express-validator` | Use `isMongoId()` for IDs, never `isInt()` |
| PDF Parsing | `pdf-parse` | For AI text extraction from uploaded PDFs |
| HTTP Client | `axios` | For downloading files from Cloudinary URLs |

### Frontend
| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 18.x | |
| Bundler | Vite 5.x | Dev server on port `5173` |
| Styling | TailwindCSS 3.x | With dark mode support |
| Routing | react-router-dom 6.x | |
| State | React Context API | 4 providers: Auth, Material, Course, Theme |
| API Client | Custom fetch wrapper | `frontend/src/services/apiClient.js` |

### Infrastructure
| Layer | Technology |
|-------|-----------|
| CI/CD | GitHub Actions (`.github/workflows/ci-cd.yml`) |
| Deployment Target | Render / Railway |

---

## 3. COMPLETE DIRECTORY STRUCTURE

```
studyhive/
├── .github/workflows/ci-cd.yml      # GitHub Actions CI/CD pipeline
├── STUDYHIVE_MASTER_CONTEXT.md       # THIS FILE — single source of truth
├── README.md                         # Project overview
├── README_SETUP.md                   # Setup & troubleshooting guide
│
├── docs/                             # Project documentation
│   ├── ARCHITECTURE.md               # System design & tech stack
│   ├── API_REFERENCE.md              # REST API endpoint docs
│   ├── AI_SYSTEM.md                  # Askuala AI engine deep dive
│   └── HACKATHON_PITCH.md            # 3-minute pitch script for judges
│
├── backend/
│   ├── package.json                  # Dependencies (see §4)
│   ├── .env                          # Environment variables (see §5)
│   └── src/
│       ├── server.js                 # Entry point — connects MongoDB, starts HTTP
│       ├── app.js                    # Express app — middleware, routes, error handler
│       │
│       ├── config/
│       │   ├── env.js                # Reads .env, exports config object
│       │   ├── db.js                 # Mongoose connection (connectDB function)
│       │   └── cloudinary.js         # Cloudinary v2 SDK configuration
│       │
│       ├── models/                   # Mongoose schemas (see §6)
│       │   ├── User.model.js
│       │   ├── Department.model.js
│       │   ├── Course.model.js
│       │   ├── Material.model.js     # Includes AI fields (aiSummary, aiKeyTerms, aiQuiz)
│       │   └── Badge.model.js
│       │
│       ├── controllers/              # Business logic (see §7)
│       │   ├── auth.controller.js    # register, login, profile, changePassword, updateProfile
│       │   ├── user.controller.js    # listUsers, updateUser, deleteUser (admin)
│       │   ├── course.controller.js  # listCourses, createCourse, updateCourse, deleteCourse
│       │   ├── material.controller.js# CRUD + triggers Askuala AI on create
│       │   ├── badge.controller.js   # listBadges, awardBadge
│       │   └── dashboard.controller.js # summary stats (admin)
│       │
│       ├── routes/                   # Express routers (see §8)
│       │   ├── auth.routes.js        # /api/auth/*
│       │   ├── user.routes.js        # /api/users/*
│       │   ├── course.routes.js      # /api/courses/*
│       │   ├── material.routes.js    # /api/materials/*
│       │   ├── badge.routes.js       # /api/badges/*
│       │   └── dashboard.routes.js   # /api/dashboard/*
│       │
│       ├── middleware/
│       │   ├── auth.js               # requireAuth, requireAdmin, optionalAuth (JWT)
│       │   ├── upload.js             # multer + CloudinaryStorage
│       │   ├── validateRequest.js    # express-validator error aggregator
│       │   └── errorHandler.js       # Global error handler (ApiError aware)
│       │
│       ├── utils/
│       │   ├── ai.js                 # Askuala AI engine (Gemini fallback chain)
│       │   ├── jwt.js                # signToken, verifyToken
│       │   ├── ApiError.js           # Custom error class (statusCode, message, details)
│       │   └── asyncHandler.js       # Wraps async route handlers for error propagation
│       │
│       └── scripts/
│           └── list-models.js        # Utility: queries available Gemini models
│
└── frontend/
    ├── package.json
    ├── vite.config.js                # Proxy /api → localhost:5000
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx                  # ReactDOM.createRoot entry
        ├── App.jsx                   # Provider tree + route definitions
        ├── index.css                 # Global styles
        │
        ├── context/                  # React Context providers (see §9)
        │   ├── AuthContext.jsx       # user, token, login, register, logout
        │   ├── MaterialContext.jsx   # materials CRUD, file URL normalization
        │   ├── CourseContext.jsx      # courses list
        │   └── ThemeContext.jsx      # dark/light mode toggle
        │
        ├── services/
        │   └── apiClient.js          # fetch wrapper: get, post, patch, del
        │
        ├── hooks/
        │   └── useBadges.js          # Badge fetching hook
        │
        ├── components/
        │   ├── Navbar.jsx            # Top navigation bar
        │   ├── Footer.jsx            # Site footer
        │   ├── MaterialCard.jsx      # Material list item card
        │   ├── UploadForm.jsx        # File upload form (multipart)
        │   ├── Toast.jsx             # Toast notification system (ToastProvider)
        │   ├── Badge.jsx             # Badge display component
        │   ├── RatingStars.jsx       # Star rating widget
        │   └── ConfettiAnimation.jsx # Celebration animation
        │
        └── pages/
            ├── Landing.jsx           # Public home page
            ├── Login.jsx             # Login form
            ├── Register.jsx          # Registration form
            ├── Dashboard.jsx         # User dashboard (private)
            ├── CourseExplorer.jsx     # Browse courses/materials
            ├── MaterialDetail.jsx    # Single material view + AI data
            ├── Upload.jsx            # Upload page (private)
            ├── Profile.jsx           # User profile (private)
            ├── Settings.jsx          # User settings (private)
            ├── Admin.jsx             # Admin panel (admin only)
            └── AboutUs.jsx           # About page
```

---

## 4. BACKEND DEPENDENCIES (package.json)

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "axios": "^1.14.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^1.41.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^9.3.3",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1",
    "multer-storage-cloudinary": "^4.0.0",
    "pdf-parse": "^2.4.5",
    "slugify": "^1.6.6"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}
```

---

## 5. ENVIRONMENT VARIABLES (.env)

```env
# Core
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/studyhive

# JWT (REQUIRED)
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d

# Cloudinary (REQUIRED for file uploads)
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

# Google Gemini AI (REQUIRED for Smart Summaries)
GEMINI_API_KEY=<gemini_key>
```

### How env.js reads them:
- `config.env` → `NODE_ENV`
- `config.port` → `PORT` (default 5000)
- `config.clientUrl` → `CLIENT_URL` (used for CORS origins, split by comma)
- `config.jwt.secret` → `JWT_SECRET`
- `config.jwt.expiresIn` → `JWT_EXPIRES_IN`
- Cloudinary and Gemini keys are read directly via `process.env.*` in their respective config files.
- **NOTE:** `config.db.*` (host, port, user, password, database) still exists in env.js but is DEAD CODE from the MySQL era. DB connection now uses `MONGODB_URI` directly in `config/db.js`.

---

## 6. DATABASE SCHEMAS (Mongoose)

### User (`models/User.model.js`)
```javascript
{
  fullName:      String (required),
  email:         String (required, unique),
  password_hash: String (required),
  role:          String (enum: 'student', 'teacher', 'admin', default: 'student'),
  department_id: ObjectId (ref: 'Department'),
  academic_year: Number,
  last_login_at: Date,
  timestamps:    true  // createdAt, updatedAt
}
```

### Department (`models/Department.model.js`)
```javascript
{
  name:       String (required, unique),
  timestamps: true
}
```

### Course (`models/Course.model.js`)
```javascript
{
  title:         String (required),
  code:          String (required),
  description:   String,
  department_id: ObjectId (ref: 'Department'),
  teacher_id:    ObjectId (ref: 'User'),
  timestamps:    true
}
```

### Material (`models/Material.model.js`) — ⚡ KEY MODEL
```javascript
{
  title:       String (required),
  description: String,
  fileUrl:     String (required),  // Cloudinary CDN URL
  fileType:    String,             // e.g. "PDF", "DOCX"
  fileSize:    Number,
  uploader_id: ObjectId (ref: 'User', required),
  course_id:   ObjectId (ref: 'Course', required),

  // === ASKUALA AI FIELDS ===
  aiSummary:   String,             // AI-generated paragraph summary
  aiKeyTerms:  [String],           // Top 5 key terms for flashcards
  aiQuiz:      [{                  // Auto-generated MCQ quiz
    question: String,
    options:  [String],
    answer:   String
  }],

  timestamps: true
}
```

### Badge (`models/Badge.model.js`)
```javascript
{
  name:        String (required),
  description: String,
  iconUrl:     String,
  criteria:    String,
  users:       [ObjectId] (ref: 'User'),  // Many-to-many via embedded array
  timestamps:  true
}
```

---

## 7. CONTROLLER PATTERNS

Every controller follows this pattern:
```javascript
const Model = require('../models/Model.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const handler = asyncHandler(async (req, res) => {
  // Use Mongoose: Model.find(), Model.findById(), Model.create(), etc.
  // Throw new ApiError(statusCode, message) on errors
  // Use .populate('ref_field') for joins
});
```

### auth.controller.js
| Function | Description |
|----------|-------------|
| `register` | Creates user, hashes password, resolves department by name, returns JWT |
| `login` | Validates credentials, updates `last_login_at`, returns JWT |
| `profile` | Returns current user from `req.user.id` |
| `changePassword` | Validates current password, hashes new one |
| `updateProfile` | Partial update of `fullName`, `academicYear` |

**JWT payload:** `{ sub: user._id, role: user.role }`

### material.controller.js — ⚡ CRITICAL
| Function | Description |
|----------|-------------|
| `createMaterial` | Receives Cloudinary `req.file.path` as `fileUrl`, triggers `generateSmartSummary()`, saves Material with AI data |
| `listMaterials` | Supports `?courseId=`, `?search=`, `?limit=` query params |
| `getMaterial` | Returns single material with populated course & uploader + AI fields |
| `updateMaterial` | Owner or admin can update title/description |
| `deleteMaterial` | Owner or admin can delete |

### user.controller.js (Admin only)
| Function | Description |
|----------|-------------|
| `listUsers` | All users with department populated |
| `updateUser` | Change role (student/teacher/admin), validates self-demotion |
| `deleteUser` | Delete user, prevents self-delete and admin-delete |

### course.controller.js
| Function | Description |
|----------|-------------|
| `listCourses` | Supports `?departmentId=`, `?search=` |
| `createCourse` | Admin only, checks duplicate `code` |
| `updateCourse` | Admin only |
| `deleteCourse` | Admin only |

### dashboard.controller.js (Admin only)
Returns `totalUsers`, `totalMaterials`, `recentMaterials` with AI summaries.

### badge.controller.js
`listBadges` (public) and `awardBadge` (admin: pushes userId into badge.users array).

---

## 8. API ROUTES — COMPLETE MAP

### Auth (`/api/auth`)
| Method | Path | Auth | Validation | Handler |
|--------|------|------|-----------|---------|
| POST | `/register` | ❌ | fullName(min:2), email, password(min:6), departmentName?(str), academicYear?(1-6) | `register` |
| POST | `/login` | ❌ | email, password | `login` |
| GET | `/me` | ✅ | — | `profile` |
| PATCH | `/password` | ✅ | currentPassword, newPassword(min:6) | `changePassword` |
| PATCH | `/profile` | ✅ | fullName?(min:2), academicYear?(1-6) | `updateProfile` |

### Materials (`/api/materials`)
| Method | Path | Auth | Validation | Handler |
|--------|------|------|-----------|---------|
| GET | `/` | Optional | courseId?(MongoId), type?(enum), search?(str), limit?(1-500), sort?(enum) | `listMaterials` |
| GET | `/:id` | ❌ | id(MongoId) | `getMaterial` |
| POST | `/` | ✅ | title(required), courseId(MongoId), file(multipart) | `createMaterial` |
| PATCH | `/:id` | ✅ | id(MongoId), title?(str), description?(str) | `updateMaterial` |
| DELETE | `/:id` | ✅ | id(MongoId) | `deleteMaterial` |
| POST | `/:id/download` | Optional | id(MongoId) | `recordDownload` |
| POST | `/:id/rate` | ✅ | id(MongoId), rating(1-5), comment?(str) | `rateMaterial` |
| POST | `/:id/bookmark` | ✅ | id(MongoId), action?(add/remove/toggle) | `toggleBookmark` |

### Courses (`/api/courses`)
| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/` | ❌ | `listCourses` |
| POST | `/` | ✅ Admin | `createCourse` |
| PATCH | `/:id` | ✅ Admin | `updateCourse` |
| DELETE | `/:id` | ✅ Admin | `deleteCourse` |

### Users (`/api/users`)
| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/` | ✅ Admin | `listUsers` |
| PATCH | `/:id` | ✅ Admin | `updateUser` |
| DELETE | `/:id` | ✅ Admin | `deleteUser` |

### Dashboard (`/api/dashboard`)
| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/summary` | ✅ Admin | `summary` |

### Badges (`/api/badges`)
| Method | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/` | ❌ | `listBadges` |
| POST | `/award` | ✅ Admin | `awardBadge` |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Returns `{ status: 'ok', environment, timestamp }` |
| GET | `/` | Returns `{ status: 'ok', service: 'StudyHive API' }` |

---

## 9. FRONTEND ARCHITECTURE

### Provider Tree (App.jsx)
```
ThemeProvider → AuthProvider → CourseProvider → MaterialProvider → ToastProvider → AppRoutes
```

### Route Map
| Path | Component | Access |
|------|-----------|--------|
| `/` | Landing | Public |
| `/about` | AboutUs | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/courses` | CourseExplorer | Public |
| `/materials/:id` | MaterialDetail | Public |
| `/dashboard` | Dashboard | Private (logged in) |
| `/upload` | Upload | Private |
| `/profile` | Profile | Private |
| `/settings` | Settings | Private |
| `/admin` | Admin | Admin only |

### API Client (`services/apiClient.js`)
- Uses native `fetch()` — no axios on frontend.
- `API_URL` defaults to `/api` (relative, proxied by Vite in dev).
- `API_HOST` used for file URLs — if URL starts with `http` it's used directly (Cloudinary), else prefixed with host.
- Sends JWT via `Authorization: Bearer <token>` header.
- Token stored in `localStorage` under key `studyhive_token`.

### Context: AuthContext
- Exposes: `user, users, token, authLoading, authError, login, register, logout, deleteUser, updateUser, refreshUsers`
- `normalizeUser()` maps backend camelCase/snake_case fields to consistent frontend shape.
- On mount: reads token from localStorage → calls `GET /api/auth/me` → sets user.
- Admin users auto-fetch `GET /api/users` for user management.

### Context: MaterialContext
- Exposes: `materials, materialsLoading, materialsError, addMaterial, updateMaterial, deleteMaterial, recordDownload, rateMaterial, refreshMaterials`
- `normalizeMaterial()` handles both camelCase and snake_case from backend.
- `buildFileUrl()` — if path starts with `http` (Cloudinary URL), use as-is; else prefix with API_HOST.
- `addMaterial()` sends `FormData` with `isFormData: true` flag.

### Context: CourseContext
- Exposes: `courses, loading, error, refresh`
- `normalizeCourse()` maps `code`→`course_code`, `name`→`course_name`, etc.

### Context: ThemeContext
- Exposes: `isDark, toggleTheme`
- Persists to localStorage key `theme`.
- Toggles `dark` class on `document.documentElement`.

---

## 10. THE ASKUALA AI ENGINE (`utils/ai.js`)

### Model Fallback Hierarchy (Best → Worst)
```
gemini-3.1-pro-preview
  ↓ (on failure)
gemini-3.1-flash-lite-preview
  ↓
gemini-2.5-pro
  ↓
gemini-2.5-flash
  ↓
gemini-pro-latest
  ↓
gemini-flash-latest
```

### Flow
1. `createMaterial` controller calls `generateSmartSummary(fileUrl, title)`.
2. If no `GEMINI_API_KEY` → returns mock data (graceful fallback).
3. If URL starts with `http` → downloads binary via `axios.get(url, { responseType: 'arraybuffer' })`.
4. If `.pdf` → pipes buffer through `pdf-parse` to extract text.
5. Truncates text to 100,000 characters (safe for all Gemini context windows).
6. Constructs structured prompt demanding strict JSON output:
   ```json
   { "aiSummary": "...", "aiKeyTerms": [...], "aiQuiz": [{ "question", "options", "answer" }] }
   ```
7. Calls `generateWithFallback(prompt)` — tries each model in hierarchy.
8. Strips any `\`\`\`json` markdown wrappers from response.
9. Parses JSON and returns it for injection into the Material document.
10. On total failure → returns `{ aiSummary: "error message", aiKeyTerms: [], aiQuiz: [] }`.

---

## 11. MIDDLEWARE REFERENCE

### auth.js
- `requireAuth`: Extracts Bearer token or cookie → `verifyToken()` → `User.findById()` → sets `req.user = { id, fullName, email, role }`.
- `requireAdmin`: Checks `req.user.role === 'admin'`, throws 403 otherwise.
- `optionalAuth`: Like requireAuth but silently passes if no token.

### upload.js
- Uses `CloudinaryStorage` with `cloudinary` config.
- Auto-detects resource type: `raw` for PDFs/docs, `image` for images, `auto` for others.
- Files go to folder `studyhive/materials` on Cloudinary.
- Public ID: `{timestamp}-{filename_without_ext}`.
- After multer processes the upload, `req.file.path` = the Cloudinary secure URL.

### validateRequest.js
- Runs `validationResult(req)` from express-validator.
- Throws `ApiError(422, 'Validation failed', errors.array())` on failure.

### errorHandler.js
- If `ApiError` → returns `{ status: 'error', message, details }` with correct status code.
- If `UnauthorizedError` → returns 401.
- Otherwise → returns 500 generic message.

---

## 12. UTILITY REFERENCE

### ApiError.js
```javascript
class ApiError extends Error {
  constructor(statusCode, message, details) { ... }
}
```

### asyncHandler.js
```javascript
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

### jwt.js
- `signToken(payload, options)` — signs with `config.jwt.secret`, default expiry `config.jwt.expiresIn` (7d).
- `verifyToken(token)` — verifies with same secret.
- JWT payload convention: `{ sub: userId, role: userRole }`.

---

## 13. CRITICAL RULES — DO NOT VIOLATE

1. **NEVER use `mysql2`, raw SQL, or `pool.query()`.** Only Mongoose ODM.
2. **NEVER write files to local disk.** All uploads go through Cloudinary.
3. **NEVER use `isInt()` for MongoDB ObjectId params.** Use `isMongoId()`.
4. **NEVER hardcode API URLs in frontend.** Use `apiClient` from `services/apiClient.js`.
5. **ALWAYS use `asyncHandler()` wrapper** for async Express route handlers.
6. **ALWAYS throw `ApiError`** for known error conditions (not generic `Error`).
7. **ALWAYS populate refs** when returning data that includes ObjectId references (`populate('department_id')`, etc.).
8. **Frontend state normalization** — always use `normalizeUser()`, `normalizeMaterial()`, `normalizeCourse()` to handle field name inconsistencies.
9. **AI failures must be graceful** — never let a Gemini error crash the upload. Always return fallback data.
10. **Token storage** — frontend uses `localStorage` key `studyhive_token`. Backend reads from `Authorization: Bearer` header or `req.cookies.token`.

---

## 14. KNOWN ISSUES & TECH DEBT

| Issue | Status | Notes |
|-------|--------|-------|
| `config/env.js` still has `config.db.*` MySQL fields | Dead code | Safe to remove but not breaking |
| `course.routes.js` uses `isInt()` for `:id` param | ⚠️ Bug | Should be `isMongoId()` |
| `badge.routes.js` uses `isInt()` for badgeId/userId | ⚠️ Bug | Should be `isMongoId()` |
| `user.routes.js` uses `isInt()` for `:id` param | ⚠️ Bug | Should be `isMongoId()` |
| `auth.routes.js` uses `isInt()` for `departmentId` | ⚠️ Bug | Should be `isMongoId()` |
| `vite.config.js` still proxies `/uploads` | Dead code | No longer needed with Cloudinary |
| `recordDownload`, `rateMaterial`, `toggleBookmark` in material controller | Stub | Returns success but doesn't persist |
| `package.json` keywords still say `mysql` | Cosmetic | Should say `mongodb` |

---

## 15. HOW TO RUN

```bash
# Terminal 1 — Backend
cd backend
npm install
# Ensure MongoDB is running on localhost:27017
# Ensure .env has MONGODB_URI, GEMINI_API_KEY, CLOUDINARY_* keys
npm run dev    # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev    # → http://localhost:5173 (proxies /api to backend)
```

---

*End of Master Context — Last updated: April 3, 2026*
