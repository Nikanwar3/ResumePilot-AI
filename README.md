# ResumePilot AI

> AI-powered ATS-friendly resume generator through conversational interviews.

## Tech Stack

**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · React Query · React Hook Form · Zustand  
**Backend:** Node.js · Express · TypeScript · Clean Architecture  
**Database:** PostgreSQL · Prisma ORM  
**Auth:** JWT + Refresh Tokens · Google OAuth  
**AI:** Gemini 1.5 Flash  
**Export:** Puppeteer PDF · DOCX

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gemini API key

### 1. Clone & Install

```bash
cd ~/Desktop/ResumePilot-AI

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```



### 3. Database Setup

```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## Features

| Feature | Description |
|---------|-------------|
| AI Interview | Conversational data collection with dynamic follow-ups |
| Profile Builder | Complete candidate profile stored in PostgreSQL |
| Job Analyzer | AI extracts keywords and requirements from JDs |
| ATS Score Engine | Multi-dimensional scoring with keyword analysis |
| Resume Generator | Professional summaries and bullet points via Gemini |
| Resume Versioning | Multiple versions (SDE, Frontend, Backend) |
| PDF Export | ATS-friendly single-column PDF via Puppeteer |
| DOCX Export | Microsoft Word format |
| Public Sharing | Share resume via public URL `/r/:slug` |
| Dark Mode | Full dark mode support |

---

## Project Structure

```
ResumePilot-AI/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, JWT, Gemini
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Database operations
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── routes/          # API routes
│   │   ├── utils/           # ATS engine, JWT helpers
│   │   └── app.ts           # Express app entry
│   └── prisma/
│       └── schema.prisma    # Database schema
│
└── frontend/
    └── src/
        ├── api/             # Axios API clients
        ├── components/      # Reusable components
        │   ├── ui/          # Button, Input, Card, Badge
        │   ├── layout/      # Header, Sidebar
        │   ├── interview/   # Chat interface
        │   └── resume/      # Preview, ATS Score
        ├── pages/           # Route-level components
        ├── store/           # Zustand stores
        └── types/           # TypeScript definitions
```

---

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### Interview
```
POST /api/interview/sessions
GET  /api/interview/sessions
POST /api/interview/sessions/:id/message
POST /api/interview/sessions/:id/extract
POST /api/interview/sessions/:id/complete
```

### Resume
```
POST /api/resume/generate
GET  /api/resume
GET  /api/resume/:id
PUT  /api/resume/:id
DELETE /api/resume/:id
POST /api/resume/:id/ats
GET  /api/resume/:id/export/pdf
GET  /api/resume/:id/export/docx
POST /api/resume/:id/version
GET  /api/resume/public/:slug
```

### Profile
```
GET  /api/profile
PUT  /api/profile
POST /api/profile/education
POST /api/profile/experience
POST /api/profile/projects
PUT  /api/profile/skills
POST /api/profile/certifications
POST /api/profile/achievements
```

---

## ATS Scoring Algorithm

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Skills Match | 30% | Required vs preferred skills comparison |
| Keyword Coverage | 25% | JD keyword presence in resume text |
| Experience Relevance | 25% | Years/type of experience vs requirements |
| Education Match | 10% | Degree level comparison |
| Project Relevance | 10% | Keyword overlap in projects |

---

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Set environment variables
# Deploy with: node dist/app.js
```

---

## Key Design Decisions

1. **No fabrication guarantee** — AI prompts explicitly forbid inventing experience
2. **Clean Architecture** — Controllers → Services → Repositories (testable layers)
3. **Token refresh** — Silent refresh with queue to prevent race conditions
4. **ATS-only PDF** — No graphics, tables, or images (single-column layout)
5. **Interview phases** — 8-phase structured flow with progress tracking

-----

Built with ❤️ 
