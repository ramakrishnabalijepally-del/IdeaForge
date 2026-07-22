import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, ideas, categories, saved_ideas, ai_generator, ai_search, admin, contact, recommendations

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-reindex ChromaDB on every startup so RAG works after cold deploys
    try:
        from app.database import SessionLocal
        from app.services.rag_service import index_ideas
        db = SessionLocal()
        count = index_ideas(db)
        logger.info(f"Startup: indexed {count} ideas into ChromaDB")
        db.close()
    except Exception as e:
        logger.warning(f"Startup reindex failed (non-fatal): {e}")
    yield


app = FastAPI(
    title="IdeaForge API",
    description="AI-Powered Startup & Manufacturing Idea Explorer",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(ideas.router, prefix=API_PREFIX)
app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(saved_ideas.router, prefix=API_PREFIX)
app.include_router(ai_generator.router, prefix=API_PREFIX)
app.include_router(ai_search.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)
app.include_router(contact.router, prefix=API_PREFIX)
app.include_router(recommendations.router, prefix=API_PREFIX)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "IdeaForge API"}
