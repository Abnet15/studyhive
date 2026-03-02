# 🐝 StudyHive Frontend

React + Vite client for the StudyHive platform. It consumes the REST API exposed by `../backend` (Express + MySQL) and gracefully falls back to mock data when the API is offline during development.

## Features

- 📚 **Course Explorer** with search + filters backed by `/api/materials`
- 📤 **Material Uploads** with real file upload + moderation flag
- ⭐ **Ratings & Downloads** persisted via REST endpoints
- 👥 **Admin Dashboard** for user/material management
- 🌓 **Theme Toggle** and responsive Tailwind UI

## Getting Started

```bash
cd frontend
npm install
cp env.example .env   # optional – override API URLs
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` + `/uploads` to `http://localhost:5000`. Make sure the backend is running (see `../backend/README.md`) or the UI will fall back to mock fixtures for read-only screens.

### Environment variables

| Key | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:5000/api` | REST base URL |
| `VITE_API_HOST` | `http://localhost:5000` | Used to build absolute file URLs |

### Build

```
npm run build   # outputs dist/
npm run preview # serve the production bundle locally
```

## Project Structure

```
frontend/
├── public/                # static assets
├── src/
│   ├── components/        # reusable UI
│   ├── context/           # Theme, Auth, Course, Material providers
│   ├── data/mockData.js   # fallback fixtures
│   ├── pages/             # routed views
│   ├── services/apiClient # REST helper + base URLs
│   ├── App.jsx
│   └── main.jsx
├── env.example
├── package.json
└── vite.config.js
```

## Notes

- Authentication now requires email + password, matching the backend schema (seed admin: `admin@studyhive.com` / `password`).
- Uploads hit `POST /api/materials` with multipart form data; adjust backend `UPLOAD_MAX_SIZE_MB` as needed.
- Remaining mock data (e.g., badge progress) can be replaced with live endpoints later without changing the UI contract.

Happy building! 🎉

