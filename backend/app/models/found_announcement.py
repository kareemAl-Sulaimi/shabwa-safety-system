from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class FoundAnnouncementState(str, enum.Enum):
    ACTIVE = "ACTIVE"
    DELIVERED = "DELIVERED"
    CLOSED = "CLOSED"


class FoundAnnouncement(Base):
    __tablename__ = "found_announcements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    found_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    contact: Mapped[str] = mapped_column(String(100), nullable=False)
    pickup_conditions: Mapped[str] = mapped_column(Text, nullable=False)
    state: Mapped[FoundAnnouncementState] = mapped_column(
        Enum(FoundAnnouncementState, native_enum=False),
        default=FoundAnnouncementState.ACTIVE,
        nullable=False,
        index=True,
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="found_announcements")
    historical_records: Mapped[list["HistoricalRecord"]] = relationship(
        "HistoricalRecord",
        back_populates="found_announcement",
        foreign_keys="HistoricalRecord.found_announcement_id",
    )

    def __repr__(self) -> str:
        return f"<FoundAnnouncement(id={self.id}, item_type={self.item_type}, state={self.state})>"
    
from app.models.user import User
from app.models.historical_record import HistoricalRecord