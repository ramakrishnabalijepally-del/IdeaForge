from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GOOGLE_API_KEY: str
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    CHROMA_DB_PATH: str = "./chroma_db"
    AI_GENERATOR_DAILY_LIMIT: int = 10

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
