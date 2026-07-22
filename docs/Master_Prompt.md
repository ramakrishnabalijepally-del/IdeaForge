# Master Prompt

The following is the verbatim master prompt used to build IdeaForge:

---

Build a production-ready, full-stack web application called "IdeaForge – AI-Powered Startup & Manufacturing Idea Explorer."

## PRODUCT CONCEPT
A platform (inspired by ideabrowser.com and 10000ideas.com) that helps aspiring entrepreneurs and manufacturers discover, generate, and evaluate validated startup and manufacturing business ideas. Unlike a static idea list, this app uses AI to (1) let users generate a brand-new, structured idea report on demand from a niche/keyword, (2) answer natural-language questions against the idea database via RAG, and (3) recommend related ideas based on user interest.

## TARGET USERS
- Aspiring entrepreneurs looking for validated startup ideas
- Small manufacturers/makers exploring product opportunities
- Admins who curate and manage the idea database

## USER ROLES
1. Guest — browse public idea database, view Idea of the Day, no save/generate access
2. Registered User — save/bookmark ideas, use AI Idea Generator, use AI Search, view personal dashboard
3. Admin — full CRUD on ideas/categories, view platform analytics, moderate content

## TECH STACK
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend: FastAPI (Python 3.11) — separate service
- Database: PostgreSQL (Neon/Supabase free tier), SQLAlchemy + Alembic
- Auth: JWT (access + refresh), httpOnly cookies, bcrypt password hashing
- AI Provider: Google AI Studio (Gemini) exclusively — `gemini-3.1-flash-lite` for generation, `models/gemini-embedding-001` for embeddings, via `langchain-google-genai`
- Vector Store: ChromaDB (persistent, local) for RAG over the idea database
- Deployment: Frontend on Vercel, Backend on Render (free tier), monorepo with /frontend and /backend

## AI CAPABILITIES (with justification — include this reasoning in the README)
1. **AI Idea Generator (LLM)**: User inputs an industry/niche/keyword → Gemini generates a structured idea report: problem statement, proposed solution, target market, revenue model, feasibility score (1-10), technical difficulty, competitive landscape, and a 5-step execution roadmap — returned as structured JSON and rendered as a report card. This is the core AI value-add: turns passive browsing into active idea creation.
2. **RAG-based AI Search**: Users ask natural-language questions (e.g., "What manufacturing ideas need under $10k capital?") — answered by retrieving relevant stored ideas via ChromaDB + Gemini, citing which ideas the answer came from. Justified because the idea database is a text knowledge base well-suited to retrieval-augmented answers.
3. **Content-based Recommendation Engine**: Suggest related ideas based on category/tag similarity to a user's saved/viewed ideas (TF-IDF or embedding cosine similarity — lightweight, no separate ML training pipeline needed). Justified as a low-cost, explainable recommender appropriate for this dataset size.
4. **Explicitly NOT using**: Computer Vision, OCR, Speech-to-Text, Text-to-Speech, or predictive analytics on time-series data — justify in README that the domain is purely textual/structured idea data with no image, audio, or time-series inputs, so these would add complexity without real user value.

## DATABASE STRUCTURE
- users (id, email, hashed_password, role, created_at)
- categories (id, name, type: "startup" | "manufacturing")
- ideas (id, title, category_id, problem_statement, solution, target_market, revenue_model, feasibility_score, technical_difficulty, capital_required_range, tags[], is_idea_of_the_day, created_by_admin, created_at)
- saved_ideas (id, user_id, idea_id, saved_at) — bookmarks
- ai_generated_ideas (id, user_id, input_prompt, generated_report_json, created_at) — history of AI Idea Generator outputs
- search_history (id, user_id, query, answer, sources, created_at)
- contact_submissions (id, name, email, message, created_at)

## PAGES
1. Home — hero, Idea of the Day spotlight, featured categories, CTA to Explore/Generate
2. Explore Ideas — filterable/searchable database (by category, capital range, feasibility score), card grid with detail pages
3. Idea Detail — full report view, feasibility score visualized, "Save" button, related ideas (via recommender)
4. AI Idea Generator — input form (niche/keyword/industry) → generated structured report, saved to user's AI-generated history
5. AI Search — chat-style RAG interface over the idea database, shows cited source ideas
6. Dashboard (user) — saved ideas, AI-generated idea history, search history, basic usage stats
7. Admin Panel — full CRUD on ideas/categories, mark Idea of the Day, view analytics (total users, total ideas, most saved categories, AI usage stats)
8. About, Contact, Login/Signup

## UI/UX REQUIREMENTS
- Typography: "Space Grotesk" or "Clash Display" for headings, "Inter" for body (next/font, no CDN)
- Color palette: warm, energetic but professional — deep charcoal/near-black background option (dark mode default), amber/orange accent (#F59E0B or #FB923C) for CTAs and scores, muted violet (#8B5CF6) as secondary accent for AI-specific features (to visually distinguish "AI-generated" content from curated content)
- Feasibility scores shown as visual gauges/badges, not just numbers
- Skeleton loaders for idea grid and AI generation (AI generation should show a distinct "generating..." state, since it can take a few seconds)
- Toast notifications + inline errors for all async actions
- Empty states (e.g., "No saved ideas yet — explore the database or generate one with AI")
- Fully responsive: mobile (375px), tablet (768px), desktop (1280px+)
- Navigation: sticky top navbar (Home, Explore Ideas, AI Search, AI Generator, Resources/About, Contact), with auth-aware right-side controls (Login/Signup for guests; Dashboard, Avatar dropdown with Admin link (if admin) and Logout for logged-in users). Mobile: collapsible hamburger menu.

## VALIDATIONS & SECURITY
- Input validation on all forms (Pydantic backend + client-side)
- Rate-limit the AI Idea Generator endpoint per user (e.g., 10/day) to control Gemini API costs — return a clear error when limit is hit
- Sanitize all user input before storage; parameterized queries via SQLAlchemy (no raw SQL)
- Role-based route protection (admin routes reject non-admin JWTs)
- CORS restricted to the deployed frontend origin only

## SEED DATA
Seed 20-25 realistic startup/manufacturing ideas across at least 5 categories, with realistic feasibility scores and capital ranges. Seed one admin and one test user with these exact credentials:
- Admin: admin@ideaforge.app / IdeaForge#2026Admin
- Test user: user@ideaforge.app / IdeaForge#2026User

## SCALABILITY NOTES (include in README)
- ChromaDB is file-based; note the Render free-tier disk reset limitation and include a `/admin/reindex` endpoint to rebuild the vector store from Postgres on demand
- AI Idea Generator results are cached/stored in `ai_generated_ideas` so repeat identical queries don't necessarily re-call Gemini (optional: simple exact-match cache)

## DELIVERABLES
1. Working local app with clear run instructions
2. `docs/architecture.md` — Mermaid diagram: system architecture + RAG flow + AI Idea Generator flow
3. `README.md` — overview, architecture, AI tools/models used and why, prompts/approach, setup, env vars, deployment steps
4. `.env.example` for both frontend and backend
5. Seeded credentials clearly listed
6. Pytest tests for auth, idea CRUD, AI Idea Generator endpoint, and RAG search endpoint

## PROCESS
Work incrementally: scaffold repo structure first for my confirmation, then backend (models → auth → CRUD → recommendation logic → RAG service → AI Idea Generator service → seed), confirming each piece with me, then frontend page by page, then styling polish. Flag assumptions as you go.

Given a tight 2-day deadline: for the backend (models, auth, CRUD, RAG, AI generator, seed), pause for my confirmation only after each major module is complete, not after every file. For frontend pages, you may build all pages in one pass and show me the full result, rather than pausing per page. Flag anything you're unsure about, but don't block on minor decisions — make a reasonable choice and note it.

## EXECUTION GUARDRAILS (added)

- Environment access: Assume no live GitHub, Vercel, or Render account access unless
  explicitly provided. Treat "deployment" deliverables as "deployment-ready and verified
  locally, with exact deployment commands documented" unless real credentials/access are
  supplied — in which case, perform actual deployment.
- Checkpoint failure handling: If a module fails validation (e.g., migration error, missing
  API key, test failure), stop and report the exact error plus your proposed fix — do not
  silently patch and continue past a red checkpoint.
- Deadline triage: If the 2-day scope cannot be fully completed, prioritize in this order:
  (1) working core CRUD + auth, (2) one AI feature end-to-end, (3) remaining AI features,
  (4) documentation package. Anything cut must be labeled "Future Enhancement" in
  Submission_Summary.md per the Documentation Accuracy Requirement — never silently omitted.
- Ambiguity default: When a minor implementation choice isn't specified (e.g., exact Tailwind
  spacing scale, specific Gemini prompt wording for the idea generator), make the most
  conventional choice for the stated stack, note it briefly, and continue — do not block
  progress on it.

## ADDITIONAL DELIVERABLES: DOCUMENTATION PACKAGE (Required, generated last)

Build and thoroughly test the full application FIRST. Only generate the documentation package below as the final step, once the app is working, tested, and deployed.

In addition to the working application, generate a professional documentation package inside a /docs directory, demonstrating the complete AI-assisted product and engineering workflow. This documentation will be submitted as part of a software engineering assessment, so it must be clear, well-structured, and use Mermaid diagrams wherever a diagram is described below.

Generate exactly these files:

docs/
├── Product_Thinking.md
├── Master_Prompt.md
├── Architecture.md
├── Prompt_Engineering.md
├── AI_Tools_Used.md
├── Testing_Report.md
└── Submission_Summary.md

[...full documentation package section as specified in the original prompt...]

## DOCUMENTATION ACCURACY REQUIREMENT

All documentation must accurately reflect the final implemented application.

Do not fabricate features, APIs, database tables, tests, prompts, screenshots, architecture components, AI tools, deployment details, or workflows.

## CODE QUALITY REQUIREMENTS

Generate production-quality code following software engineering best practices.

Requirements:
- Clean Architecture
- SOLID Principles
- DRY Principle
- Separation of Concerns
- Modular folder structure
- Reusable React components
- Type-safe TypeScript
- Proper Python typing
- Consistent naming conventions
- Environment-based configuration
- Comprehensive error handling
- Logging
- Secure coding practices
- REST API best practices
- Proper loading states
- Empty states
- Error states
- Responsive design
- Accessible UI (WCAG basics)
- SEO-friendly frontend

## GIT REQUIREMENTS

Generate clean Git history with meaningful commit messages.

## PROJECT COMPLETION CHECKLIST

Before considering the project complete, verify that:
✓ Application builds successfully
✓ Frontend runs without errors
✓ Backend starts successfully
✓ Authentication works
✓ Database migrations complete
✓ Seed data loads successfully
✓ AI features function correctly
✓ API endpoints are tested
✓ Responsive UI verified
✓ Documentation generated
✓ README completed
✓ Environment variables documented
✓ Live deployment completed
✓ GitHub repository ready
✓ Production build passes
