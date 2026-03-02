# StudyHive Monorepo

This workspace hosts both the new Express/MySQL backend and the React frontend for StudyHive.

## Structure

```
StudyHive/
├── backend/   # Node.js + Express API (MySQL)
└── frontend/  # React + Vite client app
```

## Prerequisites

- Node.js 18+
- npm 9+
- MySQL (e.g., XAMPP bundle)

## Backend Setup

```bash
cd backend
npm install
mysql -u root -p < db/schema.sql   # creates `studyhive` database
cp env.example .env                # update DB + JWT settings
npm run dev                        # launches http://localhost:5000
```

See `backend/README.md` for full API documentation.

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env               # optional, to override API URL
npm run dev                        # launches http://localhost:5173
```

The frontend defaults to `VITE_API_URL=http://localhost:5000/api` and proxies `/api` + `/uploads` during development, so it connects to the backend without additional config.

## Integration Notes

- The frontend now uses real authentication (email + password) and loads materials/courses from the API, falling back to mock data if the server is offline.
- File uploads hit `POST /api/materials` with multipart form data; configure backend `.env` to allow your client origin.
- Admin tools (user/material management, dashboard stats) require logging in as the seeded admin (`admin@studyhive.com` / `password`) or another admin account.

## Next Steps

- Finish replacing any remaining mock data (badges, documentation content) with live endpoints.
- Deploy backend (e.g., on Render/railway) and point `VITE_API_URL` at the production domain.
- Add automated tests and CI workflows as the codebase stabilizes.

