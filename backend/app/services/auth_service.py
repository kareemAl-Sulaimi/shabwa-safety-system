from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, UnauthorizedException
from app.core.security import verify_password, get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import UserCreate


class AuthService:
    @staticmethod
    async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user."""
        if not user_data.email and not user_data.phone:
            raise ValueError("Email or phone is required")

        if user_data.email:
            result = await db.execute(select(User).where(User.email == user_data.email))
            if result.scalar_one_or_none():
                raise ConflictException("Email already registered")

        if user_data.phone:
            result = await db.execute(select(User).where(User.phone == user_data.phone))
            if result.scalar_one_or_none():
                raise ConflictException("Phone already registered")

        user = User(
            name=user_data.name,
            email=user_data.email,
            phone=user_data.phone,
            hashed_password=get_password_hash(user_data.password),
            role=UserRole.USER,
            is_active=True,
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, username: str, password: str) -> User:
        """Authenticate a user."""
        result = await db.execute(select(User).where(User.email == username))
        user = result.scalar_one_or_none()

        if not user:
            result = await db.execute(select(User).where(User.phone == username))
            user = result.scalar_one_or_none()

        if not user:
            raise UnauthorizedException("Invalid credentials")

        if not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid credentials")

        if not user.is_active:
            raise UnauthorizedException("Account is deactivated")

        return user