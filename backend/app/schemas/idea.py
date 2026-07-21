from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CategoryBase(BaseModel):
    name: str
    type: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class IdeaBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    category_id: int
    problem_statement: str = Field(..., min_length=10)
    solution: str = Field(..., min_length=10)
    target_market: str = Field(..., min_length=10)
    revenue_model: str = Field(..., min_length=10)
    feasibility_score: float = Field(..., ge=1, le=10)
    technical_difficulty: str = Field(..., pattern="^(low|medium|high)$")
    capital_required_range: str
    tags: list[str] = []


class IdeaCreate(IdeaBase):
    is_idea_of_the_day: bool = False
    created_by_admin: bool = False


class IdeaUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    category_id: Optional[int] = None
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    target_market: Optional[str] = None
    revenue_model: Optional[str] = None
    feasibility_score: Optional[float] = Field(None, ge=1, le=10)
    technical_difficulty: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    capital_required_range: Optional[str] = None
    tags: Optional[list[str]] = None
    is_idea_of_the_day: Optional[bool] = None


class IdeaResponse(IdeaBase):
    id: int
    is_idea_of_the_day: bool
    created_by_admin: bool
    created_at: datetime
    category: CategoryResponse
    is_saved: bool = False

    class Config:
        from_attributes = True


class IdeaListResponse(BaseModel):
    items: list[IdeaResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SavedIdeaResponse(BaseModel):
    id: int
    idea: IdeaResponse
    saved_at: datetime

    class Config:
        from_attributes = True


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., min_length=5, max_length=255)
    message: str = Field(..., min_length=10)
