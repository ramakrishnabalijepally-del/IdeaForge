from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.idea import Idea
from app.models.saved_idea import SavedIdea
from app.models.ai_generated_idea import AIGeneratedIdea
from app.models.search_history import SearchHistory
from app.models.category import Category
from app.models.contact import ContactSubmission
from app.dependencies import require_admin
from app.services.rag_service import index_ideas

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    total_ideas = db.query(func.count(Idea.id)).scalar()
    total_saved = db.query(func.count(SavedIdea.id)).scalar()
    total_ai_generations = db.query(func.count(AIGeneratedIdea.id)).scalar()
    total_searches = db.query(func.count(SearchHistory.id)).scalar()
    total_contacts = db.query(func.count(ContactSubmission.id)).scalar()

    most_saved = (
        db.query(Category.name, func.count(SavedIdea.id).label("save_count"))
        .join(Idea, Idea.category_id == Category.id)
        .join(SavedIdea, SavedIdea.idea_id == Idea.id)
        .group_by(Category.name)
        .order_by(func.count(SavedIdea.id).desc())
        .limit(5)
        .all()
    )

    ideas_by_category = (
        db.query(Category.name, func.count(Idea.id).label("idea_count"))
        .join(Idea, Idea.category_id == Category.id)
        .group_by(Category.name)
        .order_by(func.count(Idea.id).desc())
        .all()
    )

    return {
        "total_users": total_users,
        "total_ideas": total_ideas,
        "total_saved": total_saved,
        "total_ai_generations": total_ai_generations,
        "total_searches": total_searches,
        "total_contacts": total_contacts,
        "most_saved_categories": [{"name": r[0], "save_count": r[1]} for r in most_saved],
        "ideas_by_category": [{"name": r[0], "idea_count": r[1]} for r in ideas_by_category],
    }


@router.post("/reindex")
def reindex_vector_store(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    """Rebuild ChromaDB vector store from Postgres. Use after Render disk reset."""
    count = index_ideas(db)
    return {"message": f"Reindexed {count} ideas into vector store."}


@router.get("/users")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "created_at": u.created_at}
        for u in users
    ]


@router.get("/contacts")
def list_contacts(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    contacts = db.query(ContactSubmission).order_by(ContactSubmission.created_at.desc()).all()
    return [
        {"id": c.id, "name": c.name, "email": c.email,
         "message": c.message, "created_at": c.created_at}
        for c in contacts
    ]
