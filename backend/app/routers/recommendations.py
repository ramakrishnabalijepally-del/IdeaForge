from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.idea import IdeaResponse
from app.services.recommendation import get_recommendations_for_user
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=list[IdeaResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_recommendations_for_user(db, current_user.id)
