# AI Interview Report Generator

An intelligent full-stack application that analyzes a candidate’s **resume, self-description, and job description** to generate a detailed **AI-powered interview preparation report**.

## 🚀 Live Demo
Frontend: https://resume-analyzer-kqqa.onrender.com  
Backend API: https://resume-analyzer-backend-3z1r.onrender.com


The system evaluates how well a candidate matches a job role and provides **technical questions, behavioral questions, skill gap analysis, and a preparation plan**.

---

# 🚀 Features

### 🔐 Authentication System

* Secure authentication using **JWT (JSON Web Tokens)**.
* Implemented **token blacklisting** using MongoDB to simulate a Redis-like blacklist mechanism.
* Ensures revoked tokens cannot be reused after logout.

### 🤖 AI Interview Analysis

The system analyzes:

* Resume
* Self Description
* Target Job Description

It then generates:

* **Match Score (0–100)**
* **Technical Interview Questions**
* **Behavioral Interview Questions**
* **Skill Gap Analysis**
* **7-Day Preparation Plan**

### 🧠 LLM Integration

Uses **Groq LLM APIs** to generate intelligent interview insights.

Structured responses are enforced using **Zod schema validation** to ensure reliable JSON output from the AI.

### 🔗 Full Stack Integration

* Frontend communicates with backend APIs using **Axios**.
* Global application state handled using **React Context API**.

---

# 🏗 Architecture

```
Frontend (React)
        │
        │ Axios API Requests
        ▼
Backend (Node.js + Express)
        │
        │ Authentication (JWT)
        │ Token Blacklisting (MongoDB)
        │
        ▼
AI Service Layer
        │
        │ Groq LLM API
        ▼
Structured Output Validation
        │
        │ Zod Schema
        ▼
Interview Report Response
```

---

# 🛠 Tech Stack

## Frontend

* React
* Context API
* Axios

## Backend

* Node.js
* Express.js
* MongoDB

## AI Layer

* Groq LLM API
* Zod (schema validation for structured outputs)

## Authentication

* JWT
* Token Blacklisting (MongoDB)

---

# 📊 How the AI Analysis Works

1. User submits:

   * Resume
   * Self Description
   * Job Description

2. Backend sends a prompt to the **Groq LLM**.

3. The model generates structured JSON containing:

   * matchScore
   * technicalQuestions
   * behavioralQuestions
   * skillGaps
   * preparationPlan

4. **Zod schema validation** verifies the response format.

5. Validated data is returned to the frontend.

---

# 📂 Project Structure

```
backend/
 ├── controllers/
 ├── routes/
 ├── models/
 ├── middleware/
 ├── AI/
 │    └── ai.method.js
 └── server.js

frontend/
 ├── components/
 ├── context/
 ├── pages/
 └── api/
```

---

# ⚙️ Environment Variables

Create a `.env` file in the backend:

```
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
```

---

# ▶️ Running the Project

### Backend

```
cd backend
npm install
npm run dev
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

# 📌 Example Output

The AI generates a structured interview report like:

```
{
  "matchScore": 82,
  "technicalQuestions": [...],
  "behavioralQuestions": [...],
  "skillGaps": [...],
  "preparationPlan": [...]
}
```

---

# 🔮 Future Improvements

* Resume PDF parsing
* Vector database for semantic resume analysis
* AI chat-based interview simulation
* Redis implementation for token blacklist
* Deployment with scalable cloud infrastructure

---

# 👨‍💻 Author

Built as a **Generative AI + Full Stack learning project** demonstrating:

* LLM integration
* AI structured outputs
* secure authentication
* full-stack API integration
