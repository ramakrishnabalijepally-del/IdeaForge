import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.models.category import Category, CategoryType
from app.models.idea import Idea
from app.services.auth_service import hash_password

TEST_DB_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    db = TestingSession()
    yield db
    db.close()


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=True)


@pytest.fixture
def admin_user(db):
    existing = db.query(User).filter(User.email == "admin@test.com").first()
    if existing:
        return existing
    user = User(email="admin@test.com", hashed_password=hash_password("Admin#1234"), role=UserRole.admin, full_name="Admin")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def regular_user(db):
    existing = db.query(User).filter(User.email == "user@test.com").first()
    if existing:
        return existing
    user = User(email="user@test.com", hashed_password=hash_password("User#1234"), role=UserRole.user, full_name="User")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_category(db):
    existing = db.query(Category).filter(Category.name == "Test Category").first()
    if existing:
        return existing
    cat = Category(name="Test Category", type=CategoryType.startup, description="For testing")
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@pytest.fixture
def test_idea(db, test_category):
    existing = db.query(Idea).filter(Idea.title == "Test Idea").first()
    if existing:
        return existing
    idea = Idea(
        title="Test Idea",
        category_id=test_category.id,
        problem_statement="Test problem statement here",
        solution="Test solution here",
        target_market="Test target market",
        revenue_model="Test revenue model",
        feasibility_score=7.5,
        technical_difficulty="medium",
        capital_required_range="$10,000 - $50,000",
        tags=["test", "demo"],
        created_by_admin=True,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


def get_auth_cookies(client: TestClient, email: str, password: str) -> dict:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200
    return {k: v for k, v in resp.cookies.items()}
