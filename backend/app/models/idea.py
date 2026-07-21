from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, ARRAY
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    problem_statement = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    target_market = Column(Text, nullable=False)
    revenue_model = Column(Text, nullable=False)
    feasibility_score = Column(Float, nullable=False)          # 1-10
    technical_difficulty = Column(String(20), nullable=False)  # low/medium/high
    capital_required_range = Column(String(100), nullable=False)
    tags = Column(ARRAY(String), nullable=False, default=list)
    is_idea_of_the_day = Column(Boolean, default=False, nullable=False)
    created_by_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category", back_populates="ideas")
    saved_by = relationship("SavedIdea", back_populates="idea", cascade="all, delete-orphan")
