import pytest
from tests.conftest import get_auth_cookies


def test_list_ideas_public(client, test_idea):
    resp = client.get("/api/v1/ideas")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


def test_get_idea_by_id(client, test_idea):
    resp = client.get(f"/api/v1/ideas/{test_idea.id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test Idea"


def test_get_idea_not_found(client):
    resp = client.get("/api/v1/ideas/999999")
    assert resp.status_code == 404


def test_list_ideas_filter_by_category(client, test_idea, test_category):
    resp = client.get(f"/api/v1/ideas?category_id={test_category.id}")
    assert resp.status_code == 200
    assert all(i["category"]["id"] == test_category.id for i in resp.json()["items"])


def test_list_ideas_search(client, test_idea):
    resp = client.get("/api/v1/ideas?search=Test+Idea")
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_create_idea_as_admin(client, admin_user, test_category):
    cookies = get_auth_cookies(client, "admin@test.com", "Admin#1234")
    resp = client.post("/api/v1/ideas", json={
        "title": "Admin Created Idea",
        "category_id": test_category.id,
        "problem_statement": "A real problem exists here",
        "solution": "Here is the solution",
        "target_market": "Target market description",
        "revenue_model": "Subscription model",
        "feasibility_score": 8.0,
        "technical_difficulty": "medium",
        "capital_required_range": "$10,000 - $30,000",
        "tags": ["admin", "test"],
        "created_by_admin": True,
    }, cookies=cookies)
    assert resp.status_code == 201
    assert resp.json()["title"] == "Admin Created Idea"


def test_create_idea_as_regular_user_forbidden(client, regular_user, test_category):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    resp = client.post("/api/v1/ideas", json={
        "title": "Unauthorized Idea",
        "category_id": test_category.id,
        "problem_statement": "Problem",
        "solution": "Solution",
        "target_market": "Market",
        "revenue_model": "Revenue",
        "feasibility_score": 5.0,
        "technical_difficulty": "low",
        "capital_required_range": "$1,000",
        "tags": [],
    }, cookies=cookies)
    assert resp.status_code == 403


def test_save_and_unsave_idea(client, regular_user, test_idea):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")

    resp = client.post(f"/api/v1/users/me/saved-ideas/{test_idea.id}", cookies=cookies)
    assert resp.status_code == 201

    resp = client.get("/api/v1/users/me/saved-ideas", cookies=cookies)
    assert resp.status_code == 200
    ids = [s["idea"]["id"] for s in resp.json()]
    assert test_idea.id in ids

    resp = client.delete(f"/api/v1/users/me/saved-ideas/{test_idea.id}", cookies=cookies)
    assert resp.status_code == 204


def test_save_idea_unauthenticated(client, test_idea):
    resp = client.post(f"/api/v1/users/me/saved-ideas/{test_idea.id}")
    assert resp.status_code == 401


def test_update_idea_admin(client, admin_user, test_idea):
    cookies = get_auth_cookies(client, "admin@test.com", "Admin#1234")
    resp = client.put(f"/api/v1/ideas/{test_idea.id}", json={"feasibility_score": 9.0}, cookies=cookies)
    assert resp.status_code == 200
    assert resp.json()["feasibility_score"] == 9.0


def test_delete_idea_admin(client, admin_user, test_category, db):
    from app.models.idea import Idea
    temp = Idea(
        title="To Delete", category_id=test_category.id,
        problem_statement="p", solution="s", target_market="t",
        revenue_model="r", feasibility_score=5.0, technical_difficulty="low",
        capital_required_range="$1k", tags=[], created_by_admin=True,
    )
    db.add(temp)
    db.commit()
    db.refresh(temp)

    cookies = get_auth_cookies(client, "admin@test.com", "Admin#1234")
    resp = client.delete(f"/api/v1/ideas/{temp.id}", cookies=cookies)
    assert resp.status_code == 204
