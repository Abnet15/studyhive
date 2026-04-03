# StudyHive Setup & Troubleshooting Guide 🐝

## Quick Start (MongoDB + AI Update)

### 1. Database Setup (MongoDB)

StudyHive now runs on a modern **MongoDB NoSQL architecture**. 
1. Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community) or spin up a cluster on **MongoDB Atlas**.
2. Make sure your MongoDB service is running (default port is `27017`).
3. You NO LONGER need XAMPP or MySQL.

### 2. Backend Setup

```bash
cd backend
npm install
```

Configure your environment variables carefully (see `.env` section below). 
```bash
npm run dev
```

The backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Environment Variables (.env)

Critical variables needed for the modern architecture:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/studyhive

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000

# Cloudinary (REQUIRED FOR FILE UPLOADS)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gemini AI API Key (REQUIRED FOR SMART SUMMARIES)
GEMINI_API_KEY=your_gemini_api_key

# Frontend URLs (for CORS)
WEB_CLIENT_URL=http://localhost:5173
```

## Common Issues & Fixes

### Issue 1: "File upload fails" or "Cannot read property 'path' of undefined"
**Causes:**
- You did not configure Cloudinary in `.env`.
**Fixes:**
1. Create a free Cloudinary account.
2. Add your `CLOUDINARY_*` keys to `backend/.env`.

### Issue 2: AI Summaries are returning "Mock Response"
**Causes:**
- The system could not detect your `GEMINI_API_KEY` or the key ran out of quota.
**Fixes:**
1. Check `backend/.env`. 
2. Ensure you have restarted the backend after pasting the key.
3. Check `backend/src/utils/ai.js` to see the fallback logs in your console.

### Issue 3: Can't login
All SQL credentials have been wiped! Since we moved to MongoDB, you will need to Register a brand new account using the frontend UI.
