from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/shabwa_safety",
        description="PostgreSQL async connection URL",
    )

    # JWT
    JWT_SECRET: str = Field(
        default="your-super-secret-jwt-key-change-in-production",
        description="Secret key for JWT encoding/decoding",
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    JWT_EXPIRE_MINUTES: int = Field(default=30, description="JWT token expiry in minutes")

    # App
    APP_NAME: str = Field(default="Shabwa Safety System", description="Application name")
    APP_ENV: str = Field(default="development", description="Environment: development, staging, production")
    DEBUG: bool = Field(default=True, description="Debug mode")

    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        description="Allowed CORS origins",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()