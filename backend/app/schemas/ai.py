from pydantic import BaseModel, Field
from datetime import datetime
from typing import Any


class GenerateIdeaRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500, description="Industry, niche, or keyword to generate an idea for")


class ExecutionStep(BaseModel):
    step: int
    title: str
    description: str


class GeneratedIdeaReport(BaseModel):
    title: str
    problem_statement: str
    proposed_solution: str
    target_market: str
    revenue_model: str
    feasibility_score: float
    technical_difficulty: str
    competitive_landscape: str
    execution_roadmap: list[ExecutionStep]
    estimated_capital: str
    tags: list[str]


class GenerateIdeaResponse(BaseModel):
    id: int
    input_prompt: str
    report: GeneratedIdeaReport
    created_at: datetime
    from_cache: bool = False

    class Config:
        from_attributes = True


class AISearchRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=1000)


class SourceIdea(BaseModel):
    id: int
    title: str
    category: str


class AISearchResponse(BaseModel):
    id: int
    query: str
    answer: str
    sources: list[SourceIdea]
    created_at: datetime

    class Config:
        from_attributes = True


class AIGeneratedIdeaHistory(BaseModel):
    id: int
    input_prompt: str
    generated_report_json: Any
    created_at: datetime

    class Config:
        from_attributes = True


class SearchHistoryItem(BaseModel):
    id: int
    query: str
    answer: str
    sources: Any
    created_at: datetime

    class Config:
        from_attributes = True
