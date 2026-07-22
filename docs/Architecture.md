# IdeaForge — Architecture Documentation

## 1. High-Level System Architecture

```mermaid
graph TB
    User[User Browser]
    FE[Frontend\nNext.js 14\nVercel]
    BE[Backend\nFastAPI Python 3.11\nRender]
    DB[PostgreSQL\nNeon]
    VEC[ChromaDB\nVector Store\nRender Disk]
    GEMINI[Google Gemini API\nGemini 3.1 Flash Lite\nEmbedding 001]

    User -->|HTTPS| FE
    FE -->|REST API| BE
    BE -->|SQLAlchemy ORM| DB
    BE -->|chromadb client| VEC
    BE -->|langchain-google-genai| GEMINI
```

## 2. Component Diagram

```mermaid
graph LR
    subgraph Frontend[Frontend Next.js]
        NAV[Navbar]
        HOME[Home Page]
        EXPLORE[Explore Page]
        DETAIL[Idea Detail Page]
        GEN[AI Generator Page]
        SEARCH[AI Search Page]
        DASH[Dashboard Page]
        ADMIN[Admin Panel Page]
        AUTH_PAGES[Login and Signup]
        AUTH_CTX[AuthContext]
        API_LIB[api.ts Axios Interceptors]
    end

    subgraph Backend[Backend FastAPI]
        ROUTERS[Routers\nauth ideas categories\nsaved_ideas ai_generator\nai_search recommendations\nadmin contact]
        DEPS[dependencies.py\nget_current_user\nrequire_admin]
        SERVICES[Services\nauth_service idea_service\nai_generator rag_service\nrecommendation]
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
        string role
        datetime created_at
    }

    categories {
        int id PK
        string name
        string type
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

    users ||--o{ saved_ideas : saves
    users ||--o{ ai_generated_ideas : generates
    users ||--o{ search_history : searches
    categories ||--o{ ideas : contains
    ideas ||--o{ saved_ideas : saved_by
```

## 4. API Architecture

```mermaid
graph LR
    subgraph Auth[api v1 auth]
        A1[POST register]
        A2[POST login]
        A3[POST refresh]
        A4[POST logout]
        A5[GET me]
    end

    subgraph Ideas[api v1 ideas]
        I1[GET list filter search]
        I2[GET by id]
        I3[GET related ideas]
        I4[GET idea of the day]
        I5[POST create admin only]
        I6[PUT update admin only]
        I7[DELETE admin only]
    end

    subgraph Saved[api v1 saved-ideas]
        S1[GET saved list]
        S2[POST save idea]
        S3[DELETE unsave idea]
    end

    subgraph AI[api v1 ai]
        AI1[POST generate rate-limited]
        AI2[GET generate history]
        AI3[GET generate usage]
        AI4[POST search RAG]
        AI5[GET search history]
    end

    subgraph Cats[api v1 categories]
        C1[GET all categories]
        C2[POST create admin]
        C3[PUT update admin]
        C4[DELETE admin]
    end

    subgraph AdminR[api v1 admin]
        AD1[GET analytics]
        AD2[POST reindex]
        AD3[GET users]
        AD4[GET contacts]
        AD5[GET all ideas]
    end

    subgraph Other[api v1]
        O1[GET recommendations]
        O2[POST contact]
        O3[GET health]
    end
```

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant BE as FastAPI
    participant DB as PostgreSQL

    C->>BE: POST auth/register
    BE->>DB: Check email uniqueness
    DB-->>BE: OK
    BE->>DB: INSERT user with bcrypt hash
    BE-->>C: 201 UserResponse with httpOnly cookies

    C->>BE: POST auth/login
    BE->>DB: SELECT user by email
    DB-->>BE: User record
    BE->>BE: bcrypt verify password
    BE-->>C: 200 UserResponse with access and refresh cookies

    C->>BE: GET auth/me with cookie
    BE->>BE: jwt decode access token
    BE->>DB: SELECT user by id
    BE-->>C: 200 UserResponse

    C->>BE: POST auth/refresh with cookie
    BE->>BE: jwt decode refresh token
    BE->>DB: SELECT user by id
    BE-->>C: 200 new access token with refreshed cookies

    C->>BE: POST auth/logout
    BE-->>C: 200 with expired cookie headers
```

## 6. RAG Pipeline Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant EMB as Gemini Embedding
    participant VEC as ChromaDB
    participant LLM as Gemini LLM
    participant DB as PostgreSQL

    U->>FE: Types natural language question
    FE->>BE: POST ai/search with query
    BE->>EMB: embed query
    EMB-->>BE: 1536 dim query vector
    BE->>VEC: query top 5 by cosine similarity
    VEC-->>BE: Top 5 matching idea documents
    BE->>LLM: system prompt plus context plus query
    LLM-->>BE: Grounded answer with citations
    BE->>DB: INSERT search history
    BE-->>FE: answer and sources
    FE->>U: Renders answer with source idea links
```

## 7. AI Idea Generator Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as FastAPI
    participant RATE as RateLimiter
    participant CACHE as Postgres Cache
    participant LLM as Gemini LLM
    participant DB as PostgreSQL

    U->>FE: Enters niche keyword and clicks Generate
    FE->>BE: POST ai/generate with prompt
    BE->>BE: Verify JWT requires user role
    BE->>CACHE: SELECT by exact prompt match

    alt Cache Hit
        CACHE-->>BE: Existing generated idea record
        BE-->>FE: report from cache
    else Cache Miss
        BE->>RATE: check and increment daily limit
        RATE-->>BE: OK or 429 rate limit exceeded
        BE->>LLM: system prompt plus generate idea for prompt
        LLM-->>BE: Structured JSON report
        BE->>BE: Validate feasibility score and difficulty
        BE->>DB: INSERT ai generated idea
        BE-->>FE: report from Gemini
    end

    FE->>U: Renders structured idea report card
```

## 8. Recommendation Engine Flow

```mermaid
flowchart TD
    A[User requests recommendations] --> B{User has saved ideas?}
    B -- No --> C[Return top ideas by feasibility score]
    B -- Yes --> D[Fetch all ideas from Postgres]
    D --> E[Build TF-IDF corpus from title problem solution tags]
    E --> F[fit transform corpus to TF-IDF matrix]
    F --> G[Get saved idea row vectors]
    G --> H[Compute mean profile vector]
    H --> I[cosine similarity of profile vs all idea vectors]
    I --> J[Sort by similarity descending exclude saved ideas]
    J --> K[Return top 6 recommendations]
```

## 9. Full Folder Structure

```
IdeaForge/
├── .gitignore
├── README.md
├── render.yaml
├── submission.html
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── start.sh
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── alembic/
│   │   └── versions/
│   │       └── 0001_initial_schema.py
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   ├── idea.py
│   │   │   ├── saved_idea.py
│   │   │   ├── ai_generated_idea.py
│   │   │   ├── search_history.py
│   │   │   └── contact.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── idea.py
│   │   │   └── ai.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── ideas.py
│   │   │   ├── categories.py
│   │   │   ├── saved_ideas.py
│   │   │   ├── ai_generator.py
│   │   │   ├── ai_search.py
│   │   │   ├── admin.py
│   │   │   ├── contact.py
│   │   │   └── recommendations.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── idea_service.py
│   │   │   ├── ai_generator.py
│   │   │   ├── rag_service.py
│   │   │   └── recommendation.py
│   │   └── middleware/
│   │       └── rate_limiter.py
│   ├── scripts/
│   │   └── seed.py
│   └── tests/
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_ideas.py
│       ├── test_ai_generator.py
│       └── test_rag_search.py
└── frontend/
    ├── .env.example
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── globals.css
        │   ├── page.tsx
        │   ├── explore/page.tsx
        │   ├── explore/[id]/page.tsx
        │   ├── generate/page.tsx
        │   ├── search/page.tsx
        │   ├── dashboard/page.tsx
        │   ├── admin/page.tsx
        │   ├── about/page.tsx
        │   ├── contact/page.tsx
        │   ├── login/page.tsx
        │   └── signup/page.tsx
        ├── components/
        │   ├── layout/Navbar.tsx
        │   ├── layout/Footer.tsx
        │   ├── ui/Button.tsx
        │   ├── ui/Badge.tsx
        │   ├── ui/Card.tsx
        │   ├── ui/Input.tsx
        │   ├── ui/Skeleton.tsx
        │   ├── ui/EmptyState.tsx
        │   ├── ui/FeasibilityGauge.tsx
        │   ├── ideas/IdeaCard.tsx
        │   └── ideas/IdeaFilters.tsx
        ├── context/AuthContext.tsx
        ├── hooks/useIdeas.ts
        ├── lib/api.ts
        ├── lib/utils.ts
        └── types/index.ts
```

## 10. User Journey Diagrams

### Guest and Registered User Journey

```mermaid
flowchart TD
    A[Landing Home Page] --> B{User logged in?}
    B -- No --> C[Browse Explore Page public]
    B -- No --> D[View Idea Detail public]
    B -- No --> E[Try to save or generate or search]
    E --> F[Redirected to Login]
    F --> G[Register or Login]
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
    A[Login as admin] --> B[Navbar shows Admin Panel link]
    B --> C[Admin Panel Page]
    C --> D[Analytics Tab]
    D --> D1[View total users ideas saves AI usage]
    C --> E[Ideas Tab]
    E --> E1[View all ideas in table]
    E --> E2[Add new idea]
    E --> E3[Edit existing idea]
    E --> E4[Delete idea]
    E --> E5[Toggle Idea of the Day]
    C --> F[Categories Tab]
    F --> F1[View all categories with type badges]
    C --> G[Reindex Vector Store]
    G --> G1[POST admin/reindex rebuilds ChromaDB from Postgres]
```
