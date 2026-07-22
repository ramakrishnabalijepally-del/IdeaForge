# IdeaForge – AI-Powered Startup & Manufacturing Idea Explorer

A full-stack platform that helps aspiring entrepreneurs and manufacturers discover, generate, and evaluate validated business ideas using Gemini AI.

---

## Features

- **Explore Ideas** — 25+ curated startup and manufacturing ideas across 8 categories, with filters by category, difficulty, feasibility score, and keyword search
- **AI Idea Generator** — Input any niche/keyword → Gemini 3.1 Flash Lite generates a structured idea report (problem, solution, market, revenue model, feasibility score, competitive landscape, 5-step roadmap)
- **RAG AI Search** — Natural-language questions answered by ChromaDB retrieval + Gemini generation, with citations to source ideas
- **Recommendation Engine** — TF-IDF cosine similarity recommends related ideas based on your saves
- **Idea of the Day** — Admin-curated featured idea on the homepage
- **User Dashboard** — Saved ideas, AI generation history, search history, recommendations
- **Admin Panel** — Full CRUD on ideas/categories, analytics, vector store reindex
- **Auth** — JWT access + refresh tokens in httpOnly cookies, bcrypt passwords, role-based access control

---

## AI Tools & Justification

| Tool | Model | Role | Why |
|------|-------|------|-----|
| Gemini 3.1 Flash Lite | `gemini-3.1-flash-lite` | AI Idea Generator, RAG answer generation | Fast, cost-effective LLM for structured generation and grounded Q&A |
| Gemini Embedding | `models/gemini-embedding-001` | Document + query embeddings for RAG | Native embedding model optimized for semantic similarity |
| LangChain | `langchain-google-genai` | LLM + embedding client | Clean abstraction for Gemini API |
| ChromaDB | Persistent local | Vector store for RAG retrieval | Simple, file-based, zero-infra for free tier deployment |
| scikit-learn TF-IDF | — | Recommendation engine | Lightweight, explainable similarity; no separate ML training pipeline |

**Not used (and why):** Computer Vision, OCR, Speech-to-Text, Text-to-Speech, predictive time-series analytics — the domain is purely textual/structured idea data with no image, audio, or time-series inputs. Adding these would increase complexity with no real user value.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.11), SQLAlchemy, Alembic |
| Database | PostgreSQL (Neon/Supabase free tier) |
| Vector Store | ChromaDB (persistent local) |
| Auth | JWT (httpOnly cookies), bcrypt |
| AI | Google Gemini 3.1 Flash Lite + Embedding 001 via LangChain |

---

## Folder Structure

```
IdeaForge/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app + CORS + routers
│   │   ├── config.py         # pydantic-settings
│   │   ├── database.py       # SQLAlchemy engine + session
│   │   ├── dependencies.py   # Auth deps (get_current_user, require_admin)
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # FastAPI routers (auth, ideas, ai, admin…)
│   │   ├── services/         # Business logic (auth, ideas, RAG, AI gen, recs)
│   │   └── middleware/       # Rate limiter
│   ├── alembic/              # Migrations
│   ├── scripts/seed.py       # Seed 25 ideas + admin + test user
│   └── tests/                # pytest tests
├── frontend/
│   └── src/
│       ├── app/              # Next.js App Router pages
│       ├── components/       # Reusable UI, idea, AI, admin components
│       ├── context/          # AuthContext
│       ├── hooks/            # useIdeas
│       ├── lib/              # api.ts (Axios), utils.ts
│       └── types/            # Shared TypeScript types
└── docs/                     # Documentation package
```

---

## Installation & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL database (Neon or local)
- Google AI Studio API key ([aistudio.google.com](https://aistudio.google.com))

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Create .env from .env.example
cp .env.example .env
# Edit .env with your DATABASE_URL and GOOGLE_API_KEY

# Run migrations
alembic upgrade head

# Seed database (25 ideas + admin + test user)
python -m scripts.seed

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install

# Create .env.local from .env.example
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Index Vector Store (for AI Search)

After seeding, build the ChromaDB index:

```bash
# POST /api/v1/admin/reindex (requires admin login)
curl -X POST http://localhost:8000/api/v1/admin/reindex \
  -H "Cookie: access_token=<your_admin_token>"
```

Or use the "Reindex Vector Store" button in the Admin Panel UI.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (generate with `openssl rand -hex 32`) |
| `ALGORITHM` | JWT algorithm (default: `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL (default: 30) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL (default: 7) |
| `GOOGLE_API_KEY` | Google AI Studio API key |
| `ENVIRONMENT` | `development` or `production` |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:3000`) |
| `CHROMA_DB_PATH` | ChromaDB persistence path (default: `./chroma_db`) |
| `AI_GENERATOR_DAILY_LIMIT` | Max AI generations per user per day (default: 10) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (e.g. `http://localhost:8000`) |

---

## Seeded Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ideaforge.app` | `IdeaForge#2026Admin` |
| Test User | `user@ideaforge.app` | `IdeaForge#2026User` |

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

Tests use SQLite in-memory (no Postgres required for CI). Gemini API calls are mocked.

---

## API Documentation

FastAPI auto-generates Swagger UI at:
- `http://localhost:8000/api/docs` (Swagger)
- `http://localhost:8000/api/redoc` (ReDoc)

---

## Deployment

### Backend (Render)

1. Connect GitHub repo to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from `backend/.env.example`
5. After deploy, run migrations: `alembic upgrade head` (via Render shell)
6. Seed: `python -m scripts.seed` (via Render shell)
7. Reindex ChromaDB: `POST /api/v1/admin/reindex` via Admin Panel

> **Note:** Render free tier resets the disk on each deploy. Use `/admin/reindex` to rebuild ChromaDB after every deploy. Consider Render paid tier or object storage for persistence.

### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Deploy — Vercel handles the rest

---

## Scalability Notes

- **ChromaDB**: File-based; Render free-tier disk resets on each deploy. The `/admin/reindex` endpoint rebuilds the vector index from Postgres on demand. For production, use Render paid tier persistent disk or migrate to Pinecone/Weaviate.
- **Rate Limiting**: In-memory per-process dict. Resets on server restart. For multi-instance deployments, replace with Redis-backed rate limiting.
- **AI Generator Cache**: Exact-match cache on `input_prompt` in `ai_generated_ideas` table. Global (not per-user), meaning identical prompts across users skip the Gemini call.

---

## Future Enhancements

- OAuth (Google/GitHub) login
- Email verification
- Idea voting/upvoting system
- Community-submitted ideas (with admin moderation)
- Export ideas to PDF
- Stripe subscription for higher AI generation limits
- Redis-backed rate limiting for multi-instance deployments
- Pinecone/Weaviate for production-grade vector storage
- Idea comparison view (side-by-side)
