from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.ai import GenerateIdeaRequest, GenerateIdeaResponse, AIGeneratedIdeaHistory
from app.models.ai_generated_idea import AIGeneratedIdea
from app.services.ai_generator import generate_idea_report
from app.middleware.rate_limiter import check_and_increment, get_usage_today
from app.dependencies import get_current_user
from app.models.user import User
from app.config import get_settings

router = APIRouter(prefix="/ai/generate", tags=["ai"])
settings = get_settings()


@router.post("", response_model=GenerateIdeaResponse, status_code=201)
def generate_idea(
    data: GenerateIdeaRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check exact-match cache (global)
    cached = (
        db.query(AIGeneratedIdea)
        .filter(AIGeneratedIdea.input_prompt == data.prompt.strip().lower())
        .order_by(AIGeneratedIdea.created_at.desc())
        .first()
    )
    if cached:
        return GenerateIdeaResponse(
            id=cached.id,
            input_prompt=cached.input_prompt,
            report=cached.generated_report_json,
            created_at=cached.created_at,
            from_cache=True,
        )

    # Rate limit (only for fresh generation)
    check_and_increment(current_user.id, settings.AI_GENERATOR_DAILY_LIMIT)

    try:
        report = generate_idea_report(data.prompt)
    except ValueError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")

    record = AIGeneratedIdea(
        user_id=current_user.id,
        input_prompt=data.prompt.strip().lower(),
        generated_report_json=report,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return GenerateIdeaResponse(
        id=record.id,
        input_prompt=record.input_prompt,
        report=report,
        created_at=record.created_at,
        from_cache=False,
    )


@router.get("/history", response_model=list[AIGeneratedIdeaHistory])
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(AIGeneratedIdea)
        .filter(AIGeneratedIdea.user_id == current_user.id)
        .order_by(AIGeneratedIdea.created_at.desc())
        .limit(50)
        .all()
    )


@router.get("/usage")
def get_daily_usage(current_user: User = Depends(get_current_user)):
    used = get_usage_today(current_user.id)
    return {
        "used": used,
        "limit": settings.AI_GENERATOR_DAILY_LIMIT,
        "remaining": max(0, settings.AI_GENERATOR_DAILY_LIMIT - used),
    }
