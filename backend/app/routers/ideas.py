from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.idea import IdeaCreate, IdeaUpdate, IdeaResponse, IdeaListResponse
from app.services import idea_service
from app.dependencies import get_current_user, get_optional_user, require_admin
from app.models.user import User
from typing import Optional

router = APIRouter(prefix="/ideas", tags=["ideas"])


@router.get("", response_model=IdeaListResponse)
def list_ideas(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    category_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    min_feasibility: Optional[float] = Query(None, ge=1, le=10),
    max_feasibility: Optional[float] = Query(None, ge=1, le=10),
    search: Optional[str] = Query(None, max_length=200),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    return idea_service.get_ideas(
        db, page, page_size, category_id, difficulty,
        min_feasibility, max_feasibility, search,
        current_user.id if current_user else None,
    )


@router.get("/idea-of-the-day", response_model=IdeaResponse)
def idea_of_the_day(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    idea = idea_service.get_idea_of_the_day(db, current_user.id if current_user else None)
    if not idea:
        raise HTTPException(status_code=404, detail="No Idea of the Day set")
    return idea


@router.get("/{idea_id}", response_model=IdeaResponse)
def get_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    idea = idea_service.get_idea_by_id(db, idea_id, current_user.id if current_user else None)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea


@router.get("/{idea_id}/related", response_model=list[IdeaResponse])
def related_ideas(
    idea_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    return idea_service.get_related_ideas(db, idea_id, current_user.id if current_user else None)


@router.post("", response_model=IdeaResponse, status_code=201)
def create_idea(
    data: IdeaCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return idea_service.create_idea(db, data)


@router.put("/{idea_id}", response_model=IdeaResponse)
def update_idea(
    idea_id: int,
    data: IdeaUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    idea = idea_service.update_idea(db, idea_id, data)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    return idea


@router.delete("/{idea_id}", status_code=204)
def delete_idea(
    idea_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if not idea_service.delete_idea(db, idea_id):
        raise HTTPException(status_code=404, detail="Idea not found")
