# StudyHive REST API Reference 📖

All endpoints are prefixed with `/api/v1` (or your defined base route).

## Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required? |
|--------|---------|-------------|----------------|
| `POST` | `/register` | Create a new student/faculty account | ❌ No |
| `POST` | `/login` | Authenticate and retrieve JWT | ❌ No |
| `GET` | `/profile` | Get current user metadata | ✅ Yes |

## Materials & AI (`/api/materials`)
| Method | Endpoint | Description | Auth Required? |
|--------|---------|-------------|----------------|
| `GET` | `/` | Fetch a list of all course materials. Supports `?search=` and `?courseId=` | ❌ Optional |
| `POST` | `/` | Upload a material. **Triggers Cloudinary Upload + Askuala Smart Summary** | ✅ Yes |
| `GET` | `/:id` | Fetch specific material along with AI generated Quiz/Summary | ❌ Optional |

*Note: The `POST /` endpoint intercepts `multipart/form-data` using the `file` field. It returns a JSON object containing the Cloudinary CDN link and the AI-analyzed payload.*

## Courses (`/api/courses`)
| Method | Endpoint | Description | Auth Required? |
|--------|---------|-------------|----------------|
| `GET` | `/` | Get list of courses | ❌ Optional |
| `POST` | `/` | Create a new course (Admin only) | ✅ Yes |

## Badges (`/api/badges`)
| Method | Endpoint | Description | Auth Required? |
|--------|---------|-------------|----------------|
| `GET` | `/` | Get all platform badges | ❌ Optional |
| `POST` | `/award` | Award a badge to a specific user | ✅ Yes |

---
**Authentication Standard:** Send your JWT token as a header:
`Authorization: Bearer <token>`
