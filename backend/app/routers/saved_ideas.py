from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.saved_idea import SavedIdea
from app.models.idea import Idea
from app.schemas.idea import SavedIdeaResponse
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/users/me/saved-ideas", tags=["saved-ideas"])


@router.get("", response_model=list[SavedIdeaResponse])
def list_saved(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = (
        db.query(SavedIdea)
        .options(joinedload(SavedIdea.idea).joinedload(Idea.category))
        .filter(SavedIdea.user_id == current_user.id)
        .order_by(SavedIdea.saved_at.desc())
        .all()
    )
    for s in saved:
        s.idea.is_saved = True
    return saved


@router.post("/{idea_id}", status_code=201)
def save_idea(idea_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    idea = db.query(Idea).filter(Idea.id == idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    existing = db.query(SavedIdea).filter(SavedIdea.user_id == current_user.id, SavedIdea.idea_id == idea_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already saved")
    saved = SavedIdea(user_id=current_user.id, idea_id=idea_id)
    db.add(saved)
    db.commit()
    return {"message": "Saved"}


@router.delete("/{idea_id}", status_code=204)
def unsave_idea(idea_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    saved = db.query(SavedIdea).filter(SavedIdea.user_id == current_user.id, SavedIdea.idea_id == idea_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Not saved")
    db.delete(saved)
    db.commit()
