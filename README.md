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

   If you already created the `gate_score` database in MySQL Workbench, upgrade it to the professional learning-platform schema:

   ```bash
   mysql -u root -p gate_score < database/upgrade_professional_learning_platform.sql
   ```

   The upgrade adds courses, lessons, enrollments, study plans, study tasks, doubt history, announcements, richer resources, richer tests, and analytics-ready submission data.

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
│   └── src/
│       ├── components/     # Reusable UI pieces
│       ├── data/           # Demo/sample frontend data
│       ├── services/       # API client helpers
│       ├── main.jsx        # Page shell and page views
│       └── styles.css
├── backend/
│   ├── uploads/            # Uploaded resource files
│   └── src/
│       ├── config/         # Multer and app config helpers
│       ├── controllers/    # Request handlers
│       ├── middleware/     # Express middleware
│       ├── routes/         # API route definitions
│       ├── ai.js           # AI provider wrapper
│       ├── app.js          # Express app setup
│       ├── auth.js         # JWT middleware/helpers
│       ├── db.js           # MySQL pool
│       └── index.js        # Server entry point
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

GET  /api/dashboard
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
