# StudyHive Setup & Troubleshooting Guide

## Quick Start

### 1. Database Setup (XAMPP)

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Import the schema:
   - Click "Import" tab
   - Choose file: `backend/db/schema.sql`
   - Click "Go"
   - This creates the `studyhive` database with all tables and seed data

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your MySQL credentials if needed
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Login Credentials

See `backend/LOGIN_CREDENTIALS.md` for default user accounts.

**Quick Reference:**
- **Admin:** `admin@studyhive.com` / `password`
- **Alem:** `alem@example.com` / `password`
- **Sara:** `sara@example.com` / `password`

## Common Issues & Fixes

### Issue 1: "File download link is not available yet"

**Causes:**
- File wasn't uploaded correctly
- File path not set in database
- Backend not serving static files

**Fixes:**
1. Check that `backend/uploads` directory exists
2. Verify the file was uploaded (check `backend/uploads` folder)
3. Check browser console for errors
4. Verify backend is running on port 5000
5. Check that file_path in database is `/uploads/filename`

**Debug Steps:**
```sql
-- Check if material has file_path
SELECT id, title, file_path FROM course_materials WHERE id = <material_id>;
```

### Issue 2: Uploaded materials not showing

**Causes:**
- Material not approved (should be auto-approved now)
- Query not including user's materials
- Frontend not refreshing after upload

**Fixes:**
1. Check database:
```sql
-- Check if material exists and is approved
SELECT id, title, is_approved, is_public, uploader_id 
FROM course_materials 
ORDER BY uploaded_at DESC LIMIT 10;
```

2. Check browser console for API errors
3. Verify you're logged in (materials fetch uses token)
4. Refresh the page after upload

### Issue 3: Can't login

**Causes:**
- Database not set up
- Wrong credentials
- User not active

**Fixes:**
1. Verify database exists: `SHOW DATABASES;`
2. Check users table: `SELECT email, role, is_active FROM users;`
3. Verify password hash (all default passwords are `password`)
4. Check user is active: `UPDATE users SET is_active = 1 WHERE email = 'your@email.com';`

### Issue 4: CORS errors

**Fixes:**
1. Check `backend/.env` has correct `CLIENT_URL`
2. Default should be: `CLIENT_URL=http://localhost:5173`
3. Restart backend after changing `.env`

### Issue 5: File upload fails

**Causes:**
- File too large (max 25MB default)
- Unsupported file type
- Uploads directory permissions

**Fixes:**
1. Check file size (max 25MB)
2. Supported types: PDF, ZIP, DOCX, images (JPG, PNG, GIF)
3. Ensure `backend/uploads` directory is writable
4. Check backend console for multer errors

## Database Queries for Debugging

```sql
-- Check all materials
SELECT cm.id, cm.title, cm.file_path, cm.is_approved, cm.is_public, 
       u.full_name AS uploader, c.course_code
FROM course_materials cm
JOIN users u ON u.id = cm.uploader_id
JOIN courses c ON c.id = cm.course_id
ORDER BY cm.uploaded_at DESC;

-- Check users
SELECT id, full_name, email, role, is_active FROM users;

-- Check if file exists (replace filename)
SELECT * FROM course_materials WHERE file_path LIKE '%filename%';

-- Reset a user's password (replace hash with bcrypt hash of 'password')
UPDATE users SET password_hash = '$2b$10$...' WHERE email = 'user@example.com';
```

## Testing Checklist

- [ ] Database imported successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login with admin account
- [ ] Can login with test student accounts
- [ ] Can upload a file
- [ ] Uploaded file appears in dashboard
- [ ] Uploaded file appears in profile
- [ ] Uploaded file appears in course explorer
- [ ] Can download uploaded file
- [ ] File opens/downloads correctly

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=studyhive
JWT_SECRET=your_secret_key_here
UPLOAD_MAX_SIZE_MB=25
```

### Frontend (.env) - Optional
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_HOST=http://localhost:5000
```

## Still Having Issues?

1. Check browser console (F12) for errors
2. Check backend console for errors
3. Verify MySQL is running in XAMPP
4. Check that ports 5000 and 5173 are not in use
5. Clear browser cache and localStorage
6. Restart both backend and frontend

