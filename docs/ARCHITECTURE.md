# StudyHive: Architecture Overview 🏛️

StudyHive is built with a decoupled, enterprise-grade architecture perfectly suited for rapid scaling in the Edu-Tech sector. It adopts a modern Node.js backend linked to a MongoDB cluster, heavily integrated with an intelligent AI fallback mechanism and direct-to-cloud CDNs.

## System Design Diagram

> **Client (Web/Mobile)** ↔️ **Express Gateway** ↔️ **Mongoose ODM** ↔️ **MongoDB Cluster**
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↳ **Cloudinary CDN** (File Uploads direct routing)
> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↳ **Google Gemini AI Engine** (Smart Summaries)

## 📌 Core Pillars

### 1. The Data Layer (MongoDB & Cloudinary)
We migrated from a rigid MySQL schema to a **NoSQL Document structure (MongoDB)**.
* **Why?** Unstructured data. As students upload materials, the AI analyzes them and inserts variable-length JSON results (quizzes, key terms, summaries).
* **Storage**: We eliminated local disk storage (`/uploads/`). All file streams are intercepted by `multer-storage-cloudinary` and dispatched instantly to **Cloudinary**. The database only stores the secure web URLs. Zero disk bloat. 100% uptime.

### 2. The Intelligence Layer (Askuala AI)
We implemented a highly resilient LLM pipeline (`src/utils/ai.js`).
* **Smart Fallbacks**: Instead of failing when the top-tier Gemini model is rate-limited, the system automatically walks down a `MODEL_HIERARCHY`:
  1. `gemini-3.1-pro-preview`
  2. `gemini-3.1-flash-lite-preview`
  3. `gemini-2.5-pro` ... etc.
* **Extraction**: The backend utilizes `axios` to fetch the binary buffer dynamically from the Cloudinary CDN, pipes it through `pdf-parse`, and feeds it into the LLM context limits automatically.

### 3. CI/CD & Automated Reliability
We utilize **GitHub Actions** (`.github/workflows/ci-cd.yml`).
Every pull request is automatically tested against a transient Dockerized MongoDB container, preventing any broken code from hitting production.

## 📁 Directory Structure
```text
backend/
├── src/
│   ├── config/      # Environment, Database, and Cloudinary Keys
│   ├── controllers/ # Business Logic (Mongoose queries)
│   ├── middleware/  # JWT Auth, Upload Handling
│   ├── models/      # Mongoose Schemas (User, Course, Material, Badge)
│   ├── routes/      # Express API Router endpoints
│   ├── utils/       # AI Engine, JWT signers, Error Handlers
```
