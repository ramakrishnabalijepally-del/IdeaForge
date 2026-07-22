from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.ai import AISearchRequest, AISearchResponse, SearchHistoryItem
from app.models.search_history import SearchHistory
from app.services.rag_service import rag_search
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/ai/search", tags=["ai"])


@router.post("", response_model=AISearchResponse, status_code=200)
def search(
    data: AISearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = rag_search(data.query)

    record = SearchHistory(
        user_id=current_user.id,
        query=data.query,
        answer=result["answer"],
        sources=result["sources"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return AISearchResponse(
        id=record.id,
        query=record.query,
        answer=record.answer,
        sources=record.sources,
        created_at=record.created_at,
    )


@router.get("/history", response_model=list[SearchHistoryItem])
def get_search_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.created_at.desc())
        .limit(50)
        .all()
    )
