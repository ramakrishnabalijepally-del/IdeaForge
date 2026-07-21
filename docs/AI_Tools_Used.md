# AI Tools Actually Used in IdeaForge

## Tools Used

### 1. Claude Code (Anthropic)
**Role in this project**: Sole development tool. Generated all backend Python code (FastAPI models, schemas, routers, services, migrations, tests, seed script), all frontend TypeScript/Next.js code (pages, components, hooks, context, types), all configuration files, and all documentation.

**Specific tasks performed**:
- Scaffolded the entire monorepo structure
- Wrote all SQLAlchemy ORM models and Alembic migration
- Implemented JWT auth with httpOnly cookies and bcrypt
- Built all FastAPI routers with Pydantic validation
- Implemented the AI Idea Generator service (Gemini prompt engineering + structured JSON parsing)
- Implemented the RAG service (ChromaDB indexing, embedding, retrieval, generation)
- Implemented the TF-IDF recommendation engine
- Built all Next.js pages (10 pages) and reusable components (15+ components)
- Wrote all Tailwind CSS styling with custom dark theme
- Generated all 7 documentation files

### 2. Google Gemini 2.0 Flash (`gemini-2.0-flash`)
**Provider**: Google AI Studio  
**Client library**: `langchain-google-genai`

**Role in this project**:
- **AI Idea Generator** (`/api/v1/ai/generate`): Given a user-provided niche/keyword prompt, generates a structured JSON business idea report containing: title, problem statement, proposed solution, target market, revenue model, feasibility score (1-10), technical difficulty (low/medium/high), competitive landscape, estimated capital, tags, and a 5-step execution roadmap.
- **RAG Answer Generation** (`/api/v1/ai/search`): Given retrieved context documents from ChromaDB and a user question, generates a grounded, cited answer (≤300 words) that references specific ideas by name.

**Temperature settings**:
- Idea Generator: 0.7 (creative variation)
- RAG Search: 0.3 (factual, grounded responses)

### 3. Google Gemini Embedding 001 (`models/gemini-embedding-001`)
**Provider**: Google AI Studio  
**Client library**: `langchain-google-genai` (`GoogleGenerativeAIEmbeddings`)

**Role in this project**:
- **Document indexing**: During `/admin/reindex`, embeds all idea documents from Postgres into 1536-dimensional vectors stored in ChromaDB
- **Query embedding**: At RAG search time, embeds the user's natural-language query to retrieve the top-5 most semantically similar ideas via cosine similarity

### 4. ChromaDB (`chromadb` Python client)
**Role in this project**:
- Persistent local vector store that stores idea document embeddings indexed from Postgres
- Cosine similarity retrieval for the RAG pipeline
- Rebuilt on demand via `/admin/reindex` endpoint (necessary on Render free tier disk resets)

### 5. LangChain (`langchain`, `langchain-google-genai`, `langchain-community`)
**Role in this project**:
- `ChatGoogleGenerativeAI`: LLM client for both AI Idea Generator and RAG answer generation
- `GoogleGenerativeAIEmbeddings`: Embedding client for ChromaDB indexing and query embedding
- Provides clean message-based API (`SystemMessage`, `HumanMessage`) for prompt structuring

### 6. scikit-learn (`sklearn.feature_extraction.text.TfidfVectorizer`)
**Role in this project**:
- Builds TF-IDF corpus from all idea documents (title + problem + solution + target market + tags)
- Computes cosine similarity between a user's saved-idea profile vector and all idea vectors
- Powers the `/recommendations` endpoint — suggests ideas most similar to what the user has already saved

---

## Tools Considered but NOT Used

| Tool | Reason not used |
|------|----------------|
| OpenAI GPT | Spec required Google Gemini exclusively |
| Pinecone / Weaviate | ChromaDB sufficient for MVP scale; noted as future enhancement |
| LangSmith | Observability tool; not required for MVP |
| Redis | Rate limiting is in-memory for simplicity; noted as future enhancement for multi-instance |
| Celery / task queues | AI generation is fast enough (3-8s) to handle synchronously |
