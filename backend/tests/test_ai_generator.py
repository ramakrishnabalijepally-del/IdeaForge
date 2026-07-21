"""
Tests for the AI Idea Generator endpoint.
These use mocking so no real Gemini API calls are made during CI.
"""
import pytest
from unittest.mock import patch, MagicMock
from tests.conftest import get_auth_cookies


MOCK_REPORT = {
    "title": "Mock Startup Idea",
    "problem_statement": "A serious problem exists in this space.",
    "proposed_solution": "Our solution addresses this perfectly.",
    "target_market": "SMEs worldwide, estimated 50M businesses.",
    "revenue_model": "SaaS subscription at $49/month.",
    "feasibility_score": 7.5,
    "technical_difficulty": "medium",
    "competitive_landscape": "Limited competition in this niche.",
    "estimated_capital": "$10,000 - $30,000",
    "tags": ["SaaS", "B2B", "AI"],
    "execution_roadmap": [
        {"step": 1, "title": "Validate", "description": "Talk to 20 customers."},
        {"step": 2, "title": "Build MVP", "description": "3-month build sprint."},
        {"step": 3, "title": "Launch", "description": "Product Hunt launch."},
        {"step": 4, "title": "Grow", "description": "Content marketing and SEO."},
        {"step": 5, "title": "Scale", "description": "Hire sales team."},
    ],
}


def test_generate_idea_unauthenticated(client):
    resp = client.post("/api/v1/ai/generate", json={"prompt": "fintech"})
    assert resp.status_code == 401


def test_generate_idea_authenticated(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    with patch("app.routers.ai_generator.generate_idea_report", return_value=MOCK_REPORT):
        resp = client.post("/api/v1/ai/generate", json={"prompt": "fintech startup"}, cookies=cookies)
    assert resp.status_code == 201
    data = resp.json()
    assert data["report"]["title"] == "Mock Startup Idea"
    assert data["from_cache"] is False


def test_generate_idea_cache_hit(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    # First call to populate cache
    with patch("app.routers.ai_generator.generate_idea_report", return_value=MOCK_REPORT):
        client.post("/api/v1/ai/generate", json={"prompt": "unique niche xyztest"}, cookies=cookies)
    # Second call — should hit cache without calling Gemini
    with patch("app.routers.ai_generator.generate_idea_report", side_effect=Exception("Should not be called")) as mock:
        resp = client.post("/api/v1/ai/generate", json={"prompt": "unique niche xyztest"}, cookies=cookies)
    assert resp.status_code == 201
    assert resp.json()["from_cache"] is True


def test_generate_idea_prompt_too_short(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    resp = client.post("/api/v1/ai/generate", json={"prompt": "ab"}, cookies=cookies)
    assert resp.status_code == 422


def test_get_generation_history(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    resp = client.get("/api/v1/ai/generate/history", cookies=cookies)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_get_usage(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    resp = client.get("/api/v1/ai/generate/usage", cookies=cookies)
    assert resp.status_code == 200
    data = resp.json()
    assert "used" in data
    assert "limit" in data
    assert "remaining" in data
