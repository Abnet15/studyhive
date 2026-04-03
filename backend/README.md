# StudyHive Backend API

This is the Node.js + Express backend powering the StudyHive API. It provides a robust, fully-hardened MongoDB and Cloudinary backend equipped with an Askuala AI fallback engine.

## 🚀 Quick Start for Frontend Developers

If you are working on the React frontend, here is everything you need to get the backend running locally:

### 1. Requirements
- Node.js v18+
- Active **MongoDB** instance (Local port `27017` or Atlas URI)
- No SQL or XAMPP is needed anymore.

### 2. Environment Variables (`backend/.env`)
Create your `.env` file in the `backend/` folder. It must contain these keys:
```env
# Server
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/studyhive

# Auth
JWT_SECRET=super_secret_dev_key
JWT_EXPIRES_IN=7d

# File Uploads (REQUIRED)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_sec

# AI Summarization (REQUIRED)
GEMINI_API_KEY=your_gemini_key
```

### 3. Bootstrap & Seed the Database
Instead of manually creating test users or typing out materials, run the seed script!
```bash
npm install
node src/scripts/seed.js
```
*This instantly deletes old data and creates 5 departments, 8 courses, admin users, and students.*

**Login Credentials from Seed:**
- Admin: `admin@studyhive.com` / `password`
- Student: `alem@example.com` / `password`

### 4. Start Server
```bash
npm run dev
```

## 📚 Required Context for Collaboration
If you are modifying models or API routes, please read the root `STUDYHIVE_MASTER_CONTEXT.md` document first. It is our single-source-of-truth.

## 📡 API Interactions
- See **`API_DOCUMENTATION.md`** (in this folder) for exact JSON structures and REST payloads for frontend development.
