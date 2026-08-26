from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ContentType(str, enum.Enum):
    LOST_REPORT = "lost_report"
    FOUND_ANNOUNCEMENT = "found_announcement"


class HistoricalRecord(Base):
    """
    Internal record of state transitions.

    This table is NOT the source of the user-facing History page.
    The user-facing History is built directly from the current state
    of lost reports and found announcements.
    """

    __tablename__ = "historical_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    content_type: Mapped[ContentType] = mapped_column(
        Enum(ContentType, native_enum=False),
        nullable=False,
        index=True,
    )

    lost_report_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("lost_reports.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    found_announcement_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("found_announcements.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    previous_state: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    new_state: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    extra_data: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    lost_report: Mapped[Optional["LostReport"]] = relationship(
        "LostReport",
        back_populates="historical_records",
        foreign_keys=[lost_report_id],
    )

    found_announcement: Mapped[Optional["FoundAnnouncement"]] = relationship(
        "FoundAnnouncement",
        back_populates="historical_records",
        foreign_keys=[found_announcement_id],
    )

    def __repr__(self) -> str:
        return (
            f"<HistoricalRecord("
            f"id={self.id}, "
            f"content_type={self.content_type}, "
            f"reason={self.reason})>"
        )