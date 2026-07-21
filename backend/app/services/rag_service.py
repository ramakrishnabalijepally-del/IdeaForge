import logging
import os
from typing import Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
from sqlalchemy.orm import Session
from app.config import get_settings
from app.models.idea import Idea

logger = logging.getLogger(__name__)
settings = get_settings()

def _set_google_api_key():
    os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY

COLLECTION_NAME = "ideaforge_ideas"


def _get_chroma_client() -> chromadb.PersistentClient:
    return chromadb.PersistentClient(
        path=settings.CHROMA_DB_PATH,
        settings=ChromaSettings(anonymized_telemetry=False),
    )


def _get_embeddings():
    _set_google_api_key()
    return GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")


def _idea_to_document(idea: Idea) -> str:
    return (
        f"Title: {idea.title}\n"
        f"Category: {idea.category.name if idea.category else 'Unknown'}\n"
        f"Problem: {idea.problem_statement}\n"
        f"Solution: {idea.solution}\n"
        f"Target Market: {idea.target_market}\n"
        f"Revenue Model: {idea.revenue_model}\n"
        f"Feasibility Score: {idea.feasibility_score}/10\n"
        f"Technical Difficulty: {idea.technical_difficulty}\n"
        f"Capital Required: {idea.capital_required_range}\n"
        f"Tags: {', '.join(idea.tags or [])}"
    )


def index_ideas(db: Session) -> int:
    """Index all ideas from Postgres into ChromaDB. Returns count indexed."""
    ideas = db.query(Idea).all()
    if not ideas:
        return 0

    client = _get_chroma_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    embedder = _get_embeddings()
    documents = [_idea_to_document(idea) for idea in ideas]
    embeddings = embedder.embed_documents(documents)
    metadatas = [
        {"idea_id": idea.id, "title": idea.title, "category": idea.category.name if idea.category else ""}
        for idea in ideas
    ]
    ids = [str(idea.id) for idea in ideas]

    collection.add(documents=documents, embeddings=embeddings, metadatas=metadatas, ids=ids)
    logger.info(f"Indexed {len(ideas)} ideas into ChromaDB")
    return len(ideas)


def rag_search(query: str, n_results: int = 5) -> dict:
    """Retrieve relevant ideas and generate an answer with citations."""
    client = _get_chroma_client()

    try:
        collection = client.get_collection(COLLECTION_NAME)
    except Exception:
        return {
            "answer": "The search index is not yet built. Please ask an admin to reindex.",
            "sources": [],
        }

    embedder = _get_embeddings()
    query_embedding = embedder.embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(n_results, collection.count()),
        include=["documents", "metadatas"],
    )

    if not results["documents"] or not results["documents"][0]:
        return {"answer": "No relevant ideas found for your query.", "sources": []}

    docs = results["documents"][0]
    metas = results["metadatas"][0]

    context = "\n\n---\n\n".join(docs)
    sources = [
        {"id": int(m["idea_id"]), "title": m["title"], "category": m["category"]}
        for m in metas
    ]

    _set_google_api_key()
    llm = ChatGoogleGenerativeAI(model=settings.GEMINI_MODEL, temperature=0.3)

    messages = [
        SystemMessage(
            content=(
                "You are a knowledgeable startup and manufacturing business advisor. "
                "Answer the user's question using ONLY the provided idea database context. "
                "Be specific, cite the idea titles when relevant, and keep your answer under 300 words."
            )
        ),
        HumanMessage(
            content=f"Context from idea database:\n{context}\n\nUser question: {query}"
        ),
    ]

    response = llm.invoke(messages)
    return {"answer": response.content.strip(), "sources": sources}
