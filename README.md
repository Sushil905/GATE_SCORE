# GATE_SCORE

GATE_SCORE is a full-stack Gen AI web app for GATE preparation. It includes student auth, free resources, mock tests, previous year practice, AI doubt solving, AI study planning, AI question generation, AI answer explanation, performance analytics, score prediction, recommendations, and an admin upload panel.

## Stack

- Frontend: React, Vite, Tailwind CSS, Chart.js
- Backend: Node.js, Express
- Database: MySQL
- Auth: JWT
- Uploads: Multer
- AI: OpenAI API or Gemini API, with local fallback responses for development

## Setup

1. Install dependencies:

   ```bash
   PATH=/Users/sushilmadne443/.nvm/versions/node/v26.0.0/bin:$PATH npm install
   ```

2. Create the MySQL database and tables:

   ```bash
   mysql -u root -p < database/schema.sql
   ```

   This script rebuilds the `gate_score` database into the project schema: users, branches, subjects, topics, resources, tests, questions, test attempts, student answers, AI chat history, AI study plans, progress, bookmarks, and activity logs.

3. Copy environment variables:

   ```bash
   cp .env.example backend/.env
   ```

   Then edit `backend/.env` to match your Workbench connection:

   ```text
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=gate_score
   DB_PORT=3306
   ```

4. Start both apps:

   ```bash
   PATH=/Users/sushilmadne443/.nvm/versions/node/v26.0.0/bin:$PATH npm run dev
   ```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5001`

## Directory Structure

```text
gate_score/
├── frontend/
│   ├── public/
│   │   └── images/         # Public image assets
│   └── src/
│       ├── assets/         # Local app assets and banners
│       ├── components/     # Reusable UI pieces
│       ├── context/        # React context providers
│       ├── data/           # Demo/sample frontend data and menu config
│       ├── layouts/        # App shell layouts
│       ├── pages/          # Route-level page components
│       ├── services/       # API client helpers
│       ├── App.jsx         # Frontend app orchestration
│       ├── main.jsx        # React mount
│       └── index.css       # Global styles
├── backend/
│   ├── config/             # DB, upload, and AI provider helpers
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API route definitions
│   ├── uploads/            # Uploaded resource files
│   └── server.js           # Express server entry point
├── database/
│   └── schema.sql          # MySQL schema and seed data
├── package.json
└── README.md
```

## API Routes

```text
POST /api/auth/register
POST /api/auth/login

GET  /api/resources
POST /api/resources/add

GET  /api/tests
GET  /api/tests/:id
POST /api/tests/submit

POST /api/ai/chat
POST /api/ai/study-plan
POST /api/ai/generate-questions
POST /api/ai/explain-answer

GET  /api/learning/courses
GET  /api/learning/courses/:id
POST /api/learning/courses/:id/enroll
PATCH /api/learning/lessons/:lessonId/progress
GET  /api/learning/tasks
PATCH /api/learning/tasks/:taskId
GET  /api/learning/recommendations

GET  /api/dashboard
GET  /api/predict-score
```

`POST /api/tests/submit` expects a JSON body like:

```json
{
  "testId": 1,
  "answers": {
    "1": "B",
    "2": "C"
  }
}
```

## Demo Credentials

Seeded users from `schema.sql`:

- Student: `student@gatescore.dev` / `password123`
- Admin: `admin@gatescore.dev` / `admin123`
