# IdeaForge — Architecture Documentation

## 1. High-Level System Architecture

```mermaid
graph TB
    User["👤 User / Browser"]
    FE["Frontend\nNext.js 14 (App Router)\nVercel"]
    BE["Backend\nFastAPI (Python 3.11)\nRender"]
    DB["PostgreSQL\nNeon/Supabase"]
    VEC["ChromaDB\nPersistent Local\n(Render Disk)"]
    GEMINI["Google Gemini API\n3.1 Flash Lite + Embedding 001\nvia LangChain"]

    User -->|HTTPS| FE
    FE -->|REST API (httpOnly cookies)| BE
    BE -->|SQLAlchemy ORM| DB
    BE -->|chromadb client| VEC
    BE -->|langchain-google-genai| GEMINI
```

## 2. Component Diagram

```mermaid
graph LR
    subgraph Frontend["Frontend — Next.js"]
        NAV[Navbar]
        HOME[Home Page]
        EXPLORE[Explore Page]
        DETAIL[Idea Detail Page]
        GEN[AI Generator Page]
        SEARCH[AI Search Page]
        DASH[Dashboard Page]
        ADMIN[Admin Panel Page]
        AUTH_PAGES[Login / Signup]
        AUTH_CTX[AuthContext]
        HOOKS[useIdeas hook]
        API_LIB[api.ts — Axios + interceptors]
    end

    subgraph Backend["Backend — FastAPI"]
        ROUTERS["Routers\nauth / ideas / categories\nsaved_ideas / ai_generator\nai_search / recommendations\nadmin / contact"]
        DEPS[dependencies.py\nget_current_user / require_admin]
        SERVICES["Services\nauth_service / idea_service\nai_generator / rag_service\nrecommendation"]
        RATE[rate_limiter.py\nIn-memory per-user]
        MODELS[SQLAlchemy Models]
        SCHEMAS[Pydantic Schemas]
    end

    Frontend --> Backend
    ROUTERS --> DEPS
    ROUTERS --> SERVICES
    ROUTERS --> SCHEMAS
    SERVICES --> MODELS
```

## 3. Database ER Diagram

```mermaid
erDiagram
    users {
        int id PK
        string email
        string hashed_password
        string full_name
        enum role "guest|user|admin"
        datetime created_at
    }

    categories {
        int id PK
        string name
        enum type "startup|manufacturing"
        string description
    }

    ideas {
        int id PK
        string title
        int category_id FK
        text problem_statement
        text solution
        text target_market
        text revenue_model
        float feasibility_score
        string technical_difficulty
        string capital_required_range
        array tags
        bool is_idea_of_the_day
        bool created_by_admin
        datetime created_at
    }

    saved_ideas {
        int id PK
        int user_id FK
        int idea_id FK
        datetime saved_at
    }

    ai_generated_ideas {
        int id PK
        int user_id FK
        text input_prompt
        jsonb generated_report_json
        datetime created_at
    }

    search_history {
        int id PK
        int user_id FK
        text query
        text answer
        jsonb sources
        datetime created_at
    }

    contact_submissions {
        int id PK
        string name
        string email
        text message
        datetime created_at
    }

    users ||--o{ saved_ideas : "saves"
    users ||--o{ ai_generated_ideas : "generates"
    users ||--o{ search_history : "searches"
    categories ||--o{ ideas : "contains"
    ideas ||--o{ saved_ideas : "saved_by"
```

## 4. API Architecture

```mermaid
graph LR
    subgraph Auth["/api/v1/auth"]
        A1["POST /register"]
        A2["POST /login"]
        A3["POST /refresh"]
        A4["POST /logout"]
        A5["GET /me"]
    end

    subgraph Ideas["/api/v1/ideas"]
        I1["GET / (list, filter, search)"]
        I2["GET /{id}"]
        I3["GET /{id}/related"]
        I4["GET /idea-of-the-day"]
        I5["POST / (admin only)"]
        I6["PUT /{id} (admin only)"]
        I7["DELETE /{id} (admin only)"]
    end

    subgraph Saved["/api/v1/users/me/saved-ideas"]
        S1["GET /"]
        S2["POST /{idea_id}"]
        S3["DELETE /{idea_id}"]
    end

    subgraph AI["/api/v1/ai"]
        AI1["POST /generate (rate-limited)"]
        AI2["GET /generate/history"]
        AI3["GET /generate/usage"]
        AI4["POST /search (RAG)"]
        AI5["GET /search/history"]
    end

    subgraph Cats["/api/v1/categories"]
        C1["GET /"]
        C2["POST / (admin)"]
        C3["PUT /{id} (admin)"]
        C4["DELETE /{id} (admin)"]
    end

    subgraph AdminR["/api/v1/admin"]
        AD1["GET /analytics"]
        AD2["POST /reindex"]
        AD3["GET /users"]
        AD4["GET /contacts"]
    end

    subgraph Other["/api/v1"]
        O1["GET /recommendations"]
        O2["POST /contact"]
        O3["GET /health"]
    end
```

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant BE as FastAPI
    participant DB as PostgreSQL

    C->>BE: POST /auth/register {email, password}
    BE->>DB: Check email uniqueness
    DB-->>BE: OK
    BE->>DB: INSERT user (bcrypt hashed password)
    BE-->>C: 201 UserResponse + Set-Cookie (access_token, refresh_token httpOnly)

    C->>BE: POST /auth/login {email, password}
    BE->>DB: SELECT user WHERE email=?
    DB-->>BE: User record
    BE->>BE: bcrypt.verify(password, hashed)
    BE-->>C: 200 UserResponse + Set-Cookie (access_token 30min, refresh_token 7d)

    C->>BE: GET /auth/me (Cookie: access_token)
    BE->>BE: jwt.decode(access_token)
    BE->>DB: SELECT user WHERE id=?
    BE-->>C: 200 UserResponse

    C->>BE: POST /auth/refresh (Cookie: refresh_token)
    BE->>BE: jwt.decode(refresh_token, type=refresh)
    BE->>DB: SELECT user WHERE id=?
    BE-->>C: 200 new access_token + Set-Cookie (refreshed tokens)

    C->>BE: POST /auth/logout
    BE-->>C: 200 + delete-cookie headers
```

## 6. RAG Pipeline Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant EMB as Gemini Embedding
    participant VEC as ChromaDB
    participant LLM as Gemini 3.1 Flash Lite
    participant DB as PostgreSQL

    U->>FE: Types natural-language question
    FE->>BE: POST /ai/search {query}
    BE->>EMB: embed_query(query)
    EMB-->>BE: query_embedding [1536-dim vector]
    BE->>VEC: collection.query(query_embedding, n_results=5)
    VEC-->>BE: Top-5 matching idea documents + metadata
    BE->>LLM: SystemPrompt + context_docs + user_query
    LLM-->>BE: Grounded answer with citations
    BE->>DB: INSERT search_history (query, answer, sources)
    BE-->>FE: {answer, sources: [{id, title, category}]}
    FE->>U: Renders answer + clickable source idea links
```

## 7. AI Idea Generator Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant RATE as RateLimiter
    participant CACHE as PostgreSQL Cache
    participant LLM as Gemini 3.1 Flash Lite
    participant DB as PostgreSQL

    U->>FE: Enters niche/keyword, clicks Generate
    FE->>BE: POST /ai/generate {prompt}
    BE->>BE: Verify JWT (require user role)
    BE->>CACHE: SELECT WHERE input_prompt = prompt (exact match)
    
    alt Cache Hit
        CACHE-->>BE: Existing ai_generated_idea record
        BE-->>FE: {report, from_cache: true}
    else Cache Miss
        BE->>RATE: check_and_increment(user_id, daily_limit=10)
        RATE-->>BE: OK or 429 Too Many Requests
        BE->>LLM: SystemPrompt + "Generate idea for: {prompt}" + JSON schema
        LLM-->>BE: Structured JSON report
        BE->>BE: Validate & clamp feasibility_score, technical_difficulty
        BE->>DB: INSERT ai_generated_ideas (user_id, prompt, report_json)
        BE-->>FE: {report, from_cache: false}
    end
    
    FE->>U: Renders structured idea report card
```

## 8. Recommendation Engine Flow

```mermaid
flowchart TD
    A[User requests /recommendations] --> B{User has saved ideas?}
    B -- No --> C[Return top ideas by feasibility_score DESC]
    B -- Yes --> D[Fetch all ideas from Postgres]
    D --> E[Build TF-IDF corpus from title + problem + solution + tags]
    E --> F[fit_transform corpus → TF-IDF matrix]
    F --> G[Get saved idea row vectors]
    G --> H[Compute mean profile vector]
    H --> I[cosine_similarity profile vs all idea vectors]
    I --> J[Sort by similarity DESC, exclude already-saved ideas]
    J --> K[Return top 6 recommendations]
```

## 9. Full Folder Structure

```
IdeaForge/
├── .gitignore
├── README.md
├── backend/
│   ├── .env.example               # Backend env var template
│   ├── requirements.txt           # Python dependencies
│   ├── alembic.ini                # Alembic config
│   ├── alembic/
│   │   ├── env.py                 # Migration env setup
│   │   ├── script.py.mako         # Migration template
│   │   └── versions/
│   │       └── 0001_initial_schema.py  # Full schema migration
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                # FastAPI app, CORS, router registration
│   │   ├── config.py              # pydantic-settings (all env vars)
│   │   ├── database.py            # SQLAlchemy engine, session, Base
│   │   ├── dependencies.py        # get_current_user, get_optional_user, require_admin
│   │   ├── models/                # SQLAlchemy ORM models
│   │   │   ├── user.py            # User (id, email, hashed_password, role)
│   │   │   ├── category.py        # Category (id, name, type)
│   │   │   ├── idea.py            # Idea (full schema incl. feasibility, tags, IOTD)
│   │   │   ├── saved_idea.py      # SavedIdea (user_id, idea_id, unique constraint)
│   │   │   ├── ai_generated_idea.py  # AIGeneratedIdea (prompt → JSONB report)
│   │   │   ├── search_history.py  # SearchHistory (query, answer, sources JSONB)
│   │   │   └── contact.py         # ContactSubmission
│   │   ├── schemas/               # Pydantic schemas
│   │   │   ├── auth.py            # RegisterRequest, LoginRequest, UserResponse
│   │   │   ├── idea.py            # IdeaCreate/Update/Response, IdeaListResponse
│   │   │   └── ai.py              # GenerateIdeaRequest/Response, AISearchRequest/Response
│   │   ├── routers/               # FastAPI route handlers
│   │   │   ├── auth.py            # /auth/*
│   │   │   ├── ideas.py           # /ideas/*
│   │   │   ├── categories.py      # /categories/*
│   │   │   ├── saved_ideas.py     # /users/me/saved-ideas/*
│   │   │   ├── ai_generator.py    # /ai/generate
│   │   │   ├── ai_search.py       # /ai/search
│   │   │   ├── admin.py           # /admin/*
│   │   │   ├── contact.py         # /contact
│   │   │   └── recommendations.py # /recommendations
│   │   ├── services/              # Business logic
│   │   │   ├── auth_service.py    # JWT creation/verify, bcrypt, user CRUD
│   │   │   ├── idea_service.py    # Ideas CRUD + filtering + IOTD
│   │   │   ├── ai_generator.py    # Gemini prompt → structured JSON report
│   │   │   ├── rag_service.py     # ChromaDB index + embed + retrieve + generate
│   │   │   └── recommendation.py  # TF-IDF cosine similarity recommender
│   │   └── middleware/
│   │       └── rate_limiter.py    # In-memory per-user daily rate limit
│   ├── scripts/
│   │   └── seed.py                # Seed 25 ideas + 8 categories + 2 users
│   └── tests/
│       ├── conftest.py            # SQLite test DB, fixtures
│       ├── test_auth.py           # Register, login, me, logout, role tests
│       ├── test_ideas.py          # CRUD, filters, save/unsave tests
│       ├── test_ai_generator.py   # Generator + cache + rate limit (mocked)
│       └── test_rag_search.py     # RAG search + history (mocked)
└── frontend/
    ├── .env.example
    ├── package.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx          # Root layout (fonts, AuthProvider, Toaster)
        │   ├── globals.css         # Tailwind base + custom scrollbar
        │   ├── page.tsx            # Home (IOTD, features, category browser)
        │   ├── explore/page.tsx    # Filterable idea grid
        │   ├── explore/[id]/page.tsx  # Idea detail + related ideas
        │   ├── generate/page.tsx   # AI Idea Generator with usage meter
        │   ├── search/page.tsx     # RAG AI Search chat interface
        │   ├── dashboard/page.tsx  # User dashboard (4 tabs)
        │   ├── admin/page.tsx      # Admin panel (analytics + idea CRUD)
        │   ├── about/page.tsx      # About + AI justification
        │   ├── contact/page.tsx    # Contact form
        │   ├── login/page.tsx      # Login form
        │   └── signup/page.tsx     # Registration form
        ├── components/
        │   ├── layout/Navbar.tsx   # Sticky navbar, auth-aware, mobile hamburger
        │   ├── layout/Footer.tsx   # Footer with nav links
        │   ├── ui/Button.tsx       # 5 variants (primary, secondary, ghost, danger, ai)
        │   ├── ui/Badge.tsx        # 6 variants
        │   ├── ui/Card.tsx         # Card + CardHeader + CardContent
        │   ├── ui/Input.tsx        # Input + Textarea with label/error/icon
        │   ├── ui/Skeleton.tsx     # Skeleton + IdeaCardSkeleton + IdeaGridSkeleton
        │   ├── ui/EmptyState.tsx   # Empty state with icon + CTA
        │   ├── ui/FeasibilityGauge.tsx  # SVG circular gauge (3 sizes)
        │   ├── ideas/IdeaCard.tsx  # Idea card with save toggle
        │   └── ideas/IdeaFilters.tsx    # Filter panel (search, category, difficulty, feasibility)
        ├── context/AuthContext.tsx # Auth state + login/register/logout
        ├── hooks/useIdeas.ts       # Idea fetching + save/unsave
        ├── lib/api.ts              # Axios instance + refresh token interceptor
        ├── lib/utils.ts            # cn(), formatDate(), getFeasibilityColor()
        └── types/index.ts          # All shared TypeScript interfaces
```

## 10. User Journey Diagrams

### Guest and Registered User Journey

```mermaid
flowchart TD
    A[Landing / Home] --> B{User logged in?}
    B -- No --> C[Browse Explore Page — public]
    B -- No --> D[View Idea Detail — public]
    B -- No --> E[Try to save / generate / search]
    E --> F[Redirected to Login/Signup]
    F --> G[Register / Login]
    G --> H[Dashboard]
    H --> I[Save Ideas from Explore]
    H --> J[AI Idea Generator]
    H --> K[AI RAG Search]
    H --> L[View Recommendations]
    B -- Yes --> H
```

### Admin Journey

```mermaid
flowchart TD
    A[Login as admin@ideaforge.app] --> B[Navbar shows Admin Panel link]
    B --> C[Admin Panel Page]
    C --> D[Analytics Tab]
    D --> D1[View total users / ideas / saves / AI usage]
    C --> E[Ideas Tab]
    E --> E1[View all ideas in table]
    E --> E2[Add new idea]
    E --> E3[Edit existing idea]
    E --> E4[Delete idea]
    E --> E5[Toggle Idea of the Day star]
    C --> F[Categories Tab]
    F --> F1[View all categories with type badges]
    C --> G[Reindex Vector Store button]
    G --> G1[POST /admin/reindex — rebuilds ChromaDB from Postgres]
```
