import pytest
from tests.conftest import get_auth_cookies


def test_register_new_user(client):
    resp = client.post("/api/v1/auth/register", json={
        "email": "newuser@test.com",
        "password": "NewUser#1234",
        "full_name": "New User",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "user"
    assert "access_token" in resp.cookies or "access_token" in resp.headers.get("set-cookie", "")


def test_register_duplicate_email(client, regular_user):
    resp = client.post("/api/v1/auth/register", json={
        "email": "user@test.com",
        "password": "AnyPass#1",
    })
    assert resp.status_code == 400
    assert "already registered" in resp.json()["detail"]


def test_login_valid(client, regular_user):
    resp = client.post("/api/v1/auth/login", json={"email": "user@test.com", "password": "User#1234"})
    assert resp.status_code == 200
    assert resp.json()["email"] == "user@test.com"


def test_login_invalid_password(client, regular_user):
    resp = client.post("/api/v1/auth/login", json={"email": "user@test.com", "password": "WrongPass"})
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/api/v1/auth/login", json={"email": "nobody@test.com", "password": "SomePass"})
    assert resp.status_code == 401


def test_me_authenticated(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    resp = client.get("/api/v1/auth/me", cookies=cookies)
    assert resp.status_code == 200
    assert resp.json()["email"] == "user@test.com"


def test_me_unauthenticated(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_logout(client, regular_user):
    cookies = get_auth_cookies(client, "user@test.com", "User#1234")
    resp = client.post("/api/v1/auth/logout", cookies=cookies)
    assert resp.status_code == 200


def test_admin_role(client, admin_user):
    cookies = get_auth_cookies(client, "admin@test.com", "Admin#1234")
    resp = client.get("/api/v1/auth/me", cookies=cookies)
    assert resp.status_code == 200
    assert resp.json()["role"] == "admin"
