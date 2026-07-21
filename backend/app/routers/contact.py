from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.idea import ContactCreate
from app.models.contact import ContactSubmission

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("", status_code=201)
def submit_contact(data: ContactCreate, db: Session = Depends(get_db)):
    submission = ContactSubmission(**data.model_dump())
    db.add(submission)
    db.commit()
    return {"message": "Message received. We'll be in touch!"}
