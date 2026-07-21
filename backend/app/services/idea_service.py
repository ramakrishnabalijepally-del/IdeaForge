from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from app.models.idea import Idea
from app.models.saved_idea import SavedIdea
from app.models.category import Category
from app.schemas.idea import IdeaCreate, IdeaUpdate
from typing import Optional


def get_ideas(
    db: Session,
    page: int = 1,
    page_size: int = 12,
    category_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    min_feasibility: Optional[float] = None,
    max_feasibility: Optional[float] = None,
    search: Optional[str] = None,
    current_user_id: Optional[int] = None,
):
    query = db.query(Idea).options(joinedload(Idea.category))

    if category_id:
        query = query.filter(Idea.category_id == category_id)
    if difficulty:
        query = query.filter(Idea.technical_difficulty == difficulty)
    if min_feasibility is not None:
        query = query.filter(Idea.feasibility_score >= min_feasibility)
    if max_feasibility is not None:
        query = query.filter(Idea.feasibility_score <= max_feasibility)
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                Idea.title.ilike(term),
                Idea.problem_statement.ilike(term),
                Idea.solution.ilike(term),
            )
        )

    total = query.count()
    items = query.order_by(Idea.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    saved_ids: set[int] = set()
    if current_user_id:
        saved = db.query(SavedIdea.idea_id).filter(SavedIdea.user_id == current_user_id).all()
        saved_ids = {s.idea_id for s in saved}

    for idea in items:
        idea.is_saved = idea.id in saved_ids

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


def get_idea_by_id(db: Session, idea_id: int, current_user_id: Optional[int] = None) -> Optional[Idea]:
    idea = db.query(Idea).options(joinedload(Idea.category)).filter(Idea.id == idea_id).first()
    if idea and current_user_id:
        saved = db.query(SavedIdea).filter(
            SavedIdea.user_id == current_user_id, SavedIdea.idea_id == idea_id
        ).first()
        idea.is_saved = saved is not None
    elif idea:
        idea.is_saved = False
    return idea


def create_idea(db: Session, data: IdeaCreate) -> Idea:
    idea = Idea(**data.model_dump())
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return db.query(Idea).options(joinedload(Idea.category)).filter(Idea.id == idea.id).first()


def update_idea(db: Session, idea_id: int, data: IdeaUpdate) -> Optional[Idea]:
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(idea, field, value)
    db.commit()
    db.refresh(idea)
    return db.query(Idea).options(joinedload(Idea.category)).filter(Idea.id == idea_id).first()


def delete_idea(db: Session, idea_id: int) -> bool:
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        return False
    db.delete(idea)
    db.commit()
    return True


def get_idea_of_the_day(db: Session) -> Optional[Idea]:
    return db.query(Idea).options(joinedload(Idea.category)).filter(Idea.is_idea_of_the_day == True).order_by(func.random()).first()


def get_related_ideas(db: Session, idea_id: int, limit: int = 4) -> list[Idea]:
    base = db.query(Idea).filter(Idea.id == idea_id).first()
    if not base:
        return []
    related = (
        db.query(Idea)
        .options(joinedload(Idea.category))
        .filter(Idea.id != idea_id, Idea.category_id == base.category_id)
        .order_by(func.random())
        .limit(limit)
        .all()
    )
    for r in related:
        r.is_saved = False
    return related
