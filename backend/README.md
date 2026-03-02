# StudyHive API

Node.js + Express backend paired with the StudyHive React frontend. Provides authentication, course/material management, badges, and analytics backed by MySQL (XAMPP compatible).

## Quick start

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a database:
   ```bash
   mysql -u root -p < db/schema.sql
   ```
3. Copy `env.example` to `.env` and update credentials (DB, JWT secret, allowed client origin).
4. Start the API:
   ```bash
   npm run dev
   ```
   The server listens on port `5000` by default.

## Environment variables

| Name | Description |
| --- | --- |
| `PORT` | API port |
| `CLIENT_URL` | Comma-separated list of allowed front-end origins |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL credentials |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token configuration |
| `UPLOAD_MAX_SIZE_MB` | Upload size limit (default 25 MB) |

## Available scripts

- `npm run dev` – Nodemon development server
- `npm start` – Production server

## API overview

- `POST /api/auth/register` – Create an account
- `POST /api/auth/login` – Issue JWT
- `GET /api/auth/me` – Fetch authenticated profile
- `GET /api/courses` – List courses (with filters)
- `POST /api/courses` – Admin only, create course
- `GET /api/materials` – List resources
- `POST /api/materials` – Upload resource (file upload supported)
- `POST /api/materials/:id/rate` – Rate a resource
- `POST /api/materials/:id/bookmark` – Bookmark/Unbookmark
- `GET /api/dashboard/summary` – Admin analytics

See route files under `src/routes` for the complete list and payload expectations.

## File uploads

Uploaded files are stored under `backend/uploads`. In production swap the storage adapter (e.g., S3) by editing `src/middleware/upload.js`.

## Recommended improvements

- Implement refresh tokens and email verification
- Add pagination to materials and course listing
- Add scheduled job to recompute badge assignments
- Wire the React contexts to these REST endpoints (e.g., via React Query) for live data

