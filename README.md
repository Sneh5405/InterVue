# InterVue 🚀

InterVue is a premium, state-of-the-art online technical interview and candidate assessment platform. It enables HR administrators and interviewers to manage questions, schedule real-time coding interviews, and invite candidates to complete timed online assessments evaluated inside secure, isolated sandboxes.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: TailwindCSS & Vanilla CSS
- **Code Editor**: Monaco Editor (via `@monaco-editor/react`)
- **API Client**: Axios (with custom response interceptor queues for transparent token refresh)
- **Real-Time Feed**: Socket.io-client

### Backend
- **Framework**: Node.js & Express.js
- **Database ORM**: Prisma Client (with a PostgreSQL database)
- **Background Worker**: BullMQ (using Redis for task queuing and execution tracking)
- **Real-Time Socket Room**: Socket.io
- **Sandbox Compiler**: Docker (alpine-based Node/Python secure containers)
- **Authentication**: JWT-based token rotation (stored securely in HttpOnly cookies)

---

## 🌟 Key Features

1. **Live Interview Rooms**: Collaborative real-time coding sessions between interviewers and candidates, featuring an overlay video chat and collaborative question progression.
2. **Online Assessments (OA)**: Timed, full-screen examination environments for candidates with dynamic language switching (JavaScript / Python 3) and template code injection.
3. **Question Bank**: Centralized repository for HR and Interviewers to create, read, update, and soft-delete coding, MCQ, and scenario-based questions. Question management is scoped strictly to the creator.
4. **Transparent Session Recovery**: Standard Axios interceptor queueing which intercept 401s, handles refresh token rotation, and transparently retries parallel API calls without logging the user out.
5. **Secure Execution Sandbox**: Outbound-network-disabled, memory-capped, CPU-limited alpine Docker containers executing candidate code against test cases with a strict 5-second timeout.

---

## 📋 Prerequisites

Before setting up the project locally, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Redis Server** (local or cloud-based instance, e.g., Redis Labs)
- **PostgreSQL Database** (local database or cloud provider, e.g., Supabase / Prisma Postgres)
- **Docker Desktop** (must be running on the host system to process coding submissions)

---

## ⚙️ Project Setup

Clone the repository and follow the step-by-step setup guides for both backend and frontend.

### 1. Database & Environment Config (Backend)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and supply the following variables:
   ```env
   # PostgreSQL Connection URL
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

   # JSON Web Token Keys
   JWT_ACCESS_SECRET="your-access-secret"
   JWT_REFRESH_SECRET="your-refresh-secret"

   # Redis Configuration
   REDIS_HOST="your-redis-host"
   REDIS_PORT=your-redis-port
   REDIS_PASSWORD="your-redis-password"
   REDIS_TLS="false"

   # Email Service (For OTP Verify)
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-password"
   ```
4. Push the Prisma database schema and generate the Prisma Client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### 2. Frontend Config

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```

---

## 🚀 Running the Project

To run the application locally, you will need to start both the backend server (which also runs the BullMQ queue worker) and the frontend dev server.

### Start Backend Server
Ensure your **Docker Desktop** daemon and **Redis Server** are running, then launch the backend:
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:3000`.

### Start Frontend Dev Server
In a new terminal window:
```bash
cd frontend
npm run dev
```
The web app will start on `http://localhost:5173`.

---

## 📂 Project Architecture

```
INTERVUE/
├── backend/
│   ├── prisma/             # Prisma schema and migration configurations
│   ├── src/
│   │   ├── config/         # Prisma Client initialization
│   │   ├── controllers/    # Route controllers (Auth, Submissions, Questions, etc.)
│   │   ├── middleware/     # Auth checks, ownership, and role validation
│   │   ├── routes/         # Express endpoint definitions
│   │   ├── services/       # Sandbox runner, BullMQ queues, and email utilities
│   │   ├── app.js          # Express server and socket hooks
│   │   └── worker.js       # Background BullMQ queue execution worker
│   └── scratch/            # Development testing scratch scripts
├── frontend/
│   ├── src/
│   │   ├── components/     # UI elements (Monaco Editor wrappers, Video Chat overlays)
│   │   ├── context/        # Auth and Socket global React contexts
│   │   ├── pages/          # Page layouts (Assessment environment, Dashboard, Question Bank)
│   │   ├── services/       # Axios API client routing
│   │   └── App.jsx         # Global React routes
│   └── package.json
└── package.json
```

---

## 🔒 Security Measures in Sandboxing

Candidate code submitted through the compiler queue is highly restricted using Docker runtime parameters:
- **Network Isolation**: `--network none` blocks code from calling external APIs or sending credentials.
- **Resource Limitation**: `--memory 256m` and `--cpus 1.0` restrict resource abuse and lockups.
- **Process Caps**: `--pids-limit 50` prevents fork bomb exploits.
- **Timeout Caps**: An operating system level timeout halts container execution after `5000ms` to protect against infinite loops.
