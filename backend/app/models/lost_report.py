from __future__ import annotations

import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LostReportState(str, enum.Enum):
    ACTIVE = "ACTIVE"
    FOUND = "FOUND"
    CLOSED = "CLOSED"


class LostReport(Base):
    __tablename__ = "lost_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    item_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    lost_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    contact: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[LostReportState] = mapped_column(
        Enum(LostReportState, native_enum=False),
        default=LostReportState.ACTIVE,
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
    user: Mapped["User"] = relationship("User", back_populates="lost_reports")
    historical_records: Mapped[list["HistoricalRecord"]] = relationship(
        "HistoricalRecord",
        back_populates="lost_report",
        foreign_keys="HistoricalRecord.lost_report_id",
    )

    def __repr__(self) -> str:
        return f"<LostReport(id={self.id}, item_type={self.item_type}, state={self.state})>"
    
from app.models.user import User
from app.models.historical_record import HistoricalRecord