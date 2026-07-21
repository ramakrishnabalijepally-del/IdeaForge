# IdeaForge — Product Thinking

## Problem Statement

Aspiring entrepreneurs and small manufacturers face a discovery problem: they know they want to start something, but they don't know **what** to start. Existing resources like IdeaBrowser and 10000ideas.com provide static, curated lists of business ideas — but they suffer from three fundamental limitations:

1. **Passivity**: You browse a pre-written list. There's no way to generate ideas tailored to your specific niche, capital constraints, or existing skills.
2. **No intelligence layer**: You can't ask "What manufacturing ideas need under $10k capital?" and get a reasoned answer. The idea content is locked in static pages, not queryable.
3. **No personalization**: Both platforms treat every visitor identically — no saved ideas, no recommendations based on what you've already shown interest in, no history.

IdeaForge addresses all three: AI generation on demand, RAG-powered natural-language querying, and a personalized dashboard.

---

## Why Existing Platforms Are Limited

| Platform | Strengths | Limitations |
|----------|-----------|-------------|
| IdeaBrowser.com | Clean design, categorized ideas | Static content only; no AI; no personalization; no search beyond keyword |
| 10000ideas.com | Large volume of ideas | Poor UX; no filtering; no AI; no user accounts; ideas lack structure |

Neither platform allows a user to say "I want an idea in sustainable packaging with under $50k capital and medium difficulty" and get a structured, actionable result.

---

## Target Audience & User Personas

### Persona 1 — Priya, the Career Changer (28, IT Professional)
- **Background**: 6 years in software development, wants to start a product business but has no business background
- **Pain point**: Doesn't know which industries have untapped opportunity; overwhelmed by generic "start a blog" advice
- **Need**: Structured, actionable ideas with feasibility scores she can trust, filterable by technical difficulty (since she can build apps)
- **How IdeaForge helps**: AI Generator creates a tailored idea report for "no-code tools for SMEs" in seconds; explore filter lets her filter by "low capital + high feasibility"

### Persona 2 — Rahul, the Small Manufacturer (42, Factory Owner)
- **Background**: Runs a small steel fabrication shop; wants to diversify into new product lines
- **Pain point**: Industry trade magazines are too broad; he needs manufacturing-specific opportunities matched to his existing capabilities and $100k-$300k reinvestment budget
- **How IdeaForge helps**: Filters by "manufacturing" category and capital range; AI Search answers "what manufacturing ideas need CNC machines?" citing actual database ideas

### Persona 3 — Sandra, the Student Entrepreneur (22, MBA Student)
- **Background**: Working on a business plan assignment, needs to evaluate multiple ideas quickly
- **Pain point**: Research across multiple sources takes hours; structured evaluation criteria (feasibility, competitive landscape) are hard to find
- **How IdeaForge helps**: Browses 25+ curated ideas with built-in feasibility scores; uses AI Generator to quickly generate structured reports for class presentations

---

## Proposed Solution & Value Proposition

**IdeaForge** turns passive idea browsing into active idea creation and evaluation.

**Core value propositions:**
1. **Generate on demand**: Enter any niche → get a complete structured business idea report in seconds, powered by Gemini AI
2. **Query the database intelligently**: RAG-powered search lets users ask natural-language questions and get cited, grounded answers
3. **Curated quality**: 25+ ideas researched and structured by domain experts (admin), with feasibility scores, capital ranges, and execution roadmaps
4. **Personalized experience**: Save, track, and get recommended ideas based on your interests

---

## Functional Requirements

- User registration, login, logout with JWT auth (access + refresh tokens)
- Role-based access: guest (browse only), user (save/generate/search), admin (full CRUD + analytics)
- Browse ideas with filters: category, difficulty, capital range, feasibility score, keyword search
- Paginated idea grid (12/page)
- Idea detail page with feasibility gauge, related ideas, save button
- Idea of the Day spotlight on homepage
- AI Idea Generator: prompt → structured JSON report → rendered report card
- AI Idea Generator daily rate limit (10/user/day) with usage meter
- AI Idea Generator exact-match cache (global) to skip repeat Gemini calls
- RAG AI Search: natural-language query → ChromaDB retrieval → Gemini answer → cited sources
- User dashboard: saved ideas, generation history, search history, recommendations
- Recommendation engine: TF-IDF cosine similarity on saved idea corpus
- Admin panel: full idea/category CRUD, toggle Idea of the Day, analytics dashboard
- Admin vector store reindex endpoint (`/admin/reindex`) to rebuild ChromaDB from Postgres
- Contact form with DB storage

---

## Non-Functional Requirements

**Performance**
- API response time < 300ms for CRUD endpoints (excluding AI calls)
- AI generation: 3-8 seconds (Gemini latency); frontend shows animated generating state
- Frontend loads with skeleton loaders to avoid layout shift

**Security**
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens in httpOnly cookies (not localStorage) — prevents XSS token theft
- CORS restricted to deployed frontend origin only
- SQLAlchemy ORM parameterized queries — no raw SQL, no SQL injection
- Admin routes reject non-admin JWTs with 403
- Input validated by Pydantic (backend) + client-side form validation (frontend)

**Scalability**
- ChromaDB is file-based; suitable for up to ~100k documents; for larger scale, migrate to Pinecone/Weaviate
- AI Generator rate limiting is in-memory per process; for multi-instance deploy, replace with Redis
- Database connection pool (size=5, max_overflow=10) via SQLAlchemy

**Accessibility**
- Semantic HTML (nav, main, header, footer, button, form labels)
- Focus rings on all interactive elements
- Color contrast ≥ 4.5:1 for text on dark backgrounds
- ARIA labels on icon-only buttons
- Keyboard-navigable navigation

---

## AI Opportunities Considered

| AI Technique | Selected? | Justification |
|-------------|-----------|---------------|
| **LLM (Gemini 2.0 Flash)** | ✅ Yes | Core value-add: generates structured idea reports from free-text prompts. Turns passive browsing into active creation. |
| **RAG (ChromaDB + Gemini Embeddings)** | ✅ Yes | Idea database is a text knowledge base perfectly suited to retrieval-augmented Q&A. Grounded, cited answers are more trustworthy than pure generation. |
| **ML Recommendation (TF-IDF cosine similarity)** | ✅ Yes | Lightweight, explainable recommendation based on user's saved ideas. No ML training pipeline needed; appropriate for this dataset size. |
| **Computer Vision / OCR** | ❌ No | Domain is purely textual/structured data. No images, PDFs, or visual inputs exist in the user workflow. Would add complexity without user value. |
| **Speech-to-Text / Text-to-Speech** | ❌ No | No audio input/output use cases identified. Users interact via keyboard and screen. Would add infrastructure cost without meaningful UX improvement. |
| **Predictive Time-Series Analytics** | ❌ No | No time-series data collected (idea views, market trends). Forecasting would require external data sources not available in scope. |
| **AI Agents (multi-step)** | ❌ No (future) | Single-step generation and search are sufficient for MVP. Agentic market research (auto-scraping competitors, financial modeling) is a viable future enhancement. |
| **NLP Classification** | ❌ No | Category tagging handled by admin at submission time. Auto-classification would be useful at scale but not needed for 25+ seeded ideas. |

---

## Future Roadmap (NOT implemented — ideas only)

- **OAuth login** (Google, GitHub) for frictionless signup
- **Email verification** and password reset flows
- **Community-submitted ideas** with admin moderation queue
- **Idea upvoting** and community scoring system
- **AI Market Research Agent** — multi-step agent that auto-researches competitors, searches news, estimates TAM for a generated idea
- **PDF export** of generated idea reports
- **Stripe subscription** for higher AI generation limits (e.g., 50/day on Pro plan)
- **Redis-backed rate limiting** for multi-instance deployments
- **Pinecone/Weaviate migration** for production-grade vector storage with persistence
- **Idea comparison view** — side-by-side feasibility comparison of 2-3 ideas
- **Email digest** — weekly "Idea of the Week" newsletter
- **Mobile app** — React Native companion
