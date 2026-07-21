"""
Tests for the RAG AI Search endpoint.
Gemini and ChromaDB calls are mocked.
"""
import pytest
from unittest.mock import patch
from tests.conftest import get_auth_cookies


MOCK_RAG_RESULT = {
    "answer": "Based on the idea database, there are several manufacturing ideas under $10k including Upcycled Grain Snack Manufacturing.",
    "sources": [
        {"id": 1, "title": "Upcycled Grain Snack Manufacturing", "category": "Food & Beverage Production"},
    ],
}


def test_search_unauthenticated(client):
    resp = client.post("/api/v1/ai/search", json={"query": "ideas under 10k"})
    assert resp.status_code == 401


def test_search_authenticated(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    with patch("app.routers.ai_search.rag_search", return_value=MOCK_RAG_RESULT):
        resp = client.post("/api/v1/ai/search", json={"query": "What manufacturing ideas need under $10k capital?"}, cookies=cookies)
    assert resp.status_code == 201
    data = resp.json()
    assert "answer" in data
    assert "sources" in data
    assert len(data["sources"]) >= 1


def test_search_saves_to_history(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    with patch("app.routers.ai_search.rag_search", return_value=MOCK_RAG_RESULT):
        client.post("/api/v1/ai/search", json={"query": "agri-tech ideas with high feasibility"}, cookies=cookies)

    resp = client.get("/api/v1/ai/search/history", cookies=cookies)
    assert resp.status_code == 200
    history = resp.json()
    assert len(history) >= 1
    queries = [h["query"] for h in history]
    assert "agri-tech ideas with high feasibility" in queries


def test_search_query_too_short(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    resp = client.post("/api/v1/ai/search", json={"query": "ab"}, cookies=cookies)
    assert resp.status_code == 422


def test_search_history_unauthenticated(client):
    resp = client.get("/api/v1/ai/search/history")
    assert resp.status_code == 401
