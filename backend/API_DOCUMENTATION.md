# Frontend-to-Backend API Contract

This document provides exact payloads, responses, and headers for the frontend engineers collaborating on the project.

## Authorization Header
All private routes request a JWT.
> `Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication (`/api/auth`)

### `POST /register`
**Request Payload:**
```json
{
  "fullName": "Abebe Bekele",
  "email": "abebe@example.com",
  "password": "securepassword",
  "departmentName": "Software Engineering",
  "academicYear": 3
}
```
**Response:**
```json
{
  "token": "ey...",
  "user": {
    "id": "60f7a...",
    "fullName": "Abebe Bekele",
    "email": "abebe@example.com",
    "role": "student",
    "departmentName": "Software Engineering"
  }
}
```

### `POST /login`
**Request Payload:**
```json
{
  "email": "admin@studyhive.com",
  "password": "password"
}
```

---

## 2. Materials (`/api/materials`)

### `POST /` (Upload Material)
**IMPORTANT:** This request MUST be sent as `multipart/form-data`, not JSON.
**Form Fields:**
- `title` (Text)
- `description` (Text, optional)
- `courseId` (Text, MongoDB ObjectId representation)
- `file` (File object)

**Response:**
Returns the complete material object including the Cloudinary `fileUrl` and the auto-generated `aiSummary`, `aiKeyTerms`, and `aiQuiz`.

### `GET /` (List Materials)
Allows queries: `?courseId=123...&search=calculus&limit=30`
**Response:**
```json
{
  "materials": [
    {
      "id": "64ca81...",
      "title": "Data Structures PDF",
      "fileUrl": "https://res.cloudinary.com/...",
      "downloads": 12,
      "rating": 4.5,
      "ratingCount": 2,
      "courseName": "Data Structures",
      "uploaderName": "Alem Tadesse",
      "aiSummary": "This document covers Linked Lists...",
      "aiKeyTerms": ["Nodes", "Pointers"]
    }
  ]
}
```

### `POST /:id/download`
**Action:** Increments download count by 1.
**Response:** `{ "message": "Download recorded", "downloads": 13 }`

### `POST /:id/rate`
**Request Payload:**
```json
{
  "rating": 5, 
  "comment": "Excellent material!"
}
```

---

## 3. Courses (`/api/courses`)

### `GET /`
**Response:**
```json
{
  "courses": [
    {
      "id": "60cf9...",
      "course_code": "CS201",
      "course_name": "Data Structures & Algorithms",
      "department_name": "Computer Science"
    }
  ]
}
```

---

## ⚠️ Common Developer Errors

1. **Passing Integers as IDs**: Since we migrated to MongoDB, all IDs (Course ID, Material ID, User ID) are 24-character hex strings (`isMongoId()`). Ensure the React context passes `course.id` correctly, not integers like `1`.
2. **Missing `multipart/form-data`**: Doing a normal `application/json` post on the upload route will immediately trigger an `express-validator` 400 Bad Request error. Use standard `FormData` in React.
