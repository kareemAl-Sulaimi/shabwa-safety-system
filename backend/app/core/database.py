from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings
from app.db.base import Base

# Import all models so SQLAlchemy registers them with Base.metadata.
from app.models import user, lost_report, found_announcement, historical_record


settings = get_settings()


# ---------------------------------------------------------
# Database Engine
# ---------------------------------------------------------

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)


# ---------------------------------------------------------
# Session Factory
# ---------------------------------------------------------

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ---------------------------------------------------------
# Database Dependency
# ---------------------------------------------------------

async def get_db():
    """Provide an async database session."""
    async with async_session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------
# Database Initialization
# ---------------------------------------------------------

async def init_db() -> None:
    """Create database tables if they do not already exist."""
    print("🔄 Creating tables...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Tables created successfully")


# ---------------------------------------------------------
# Database Shutdown
# ---------------------------------------------------------

async def close_db() -> None:
    """Dispose database connections."""
    await engine.dispose()