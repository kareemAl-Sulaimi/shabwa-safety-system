from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import BadRequestException
from app.models.lost_report import LostReport, LostReportState
from app.models.found_announcement import (
    FoundAnnouncement,
    FoundAnnouncementState,
)
from app.schemas.history import HistoryItemResponse


router = APIRouter()


@router.get("/", response_model=list[HistoryItemResponse])
async def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    content_type: Optional[str] = Query(
        None,
        description=(
            "Filter by content type: "
            "lost_report or found_announcement"
        ),
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the user-facing History.

    Rules:

    Lost reports:
        ACTIVE -> Updates
        FOUND  -> History
        CLOSED -> History

    Found announcements:
        ACTIVE     -> Updates
        DELIVERED  -> History
        CLOSED     -> History

    Therefore, anything that is no longer ACTIVE appears here.
    """

    if content_type not in (
        None,
        "lost_report",
        "found_announcement",
    ):
        raise BadRequestException(
            "content_type must be 'lost_report' or 'found_announcement'"
        )

    history_items: list[HistoryItemResponse] = []

    # ---------------------------------------------------------
    # Lost Reports
    # ---------------------------------------------------------

    if content_type in (None, "lost_report"):
        result = await db.execute(
            select(LostReport)
            .where(
                LostReport.deleted_at.is_(None),
                LostReport.state.in_(
                    (
                        LostReportState.FOUND,
                        LostReportState.CLOSED,
                    )
                ),
            )
        )

        reports = result.scalars().all()

        for report in reports:
            history_items.append(
                HistoryItemResponse(
                    id=report.id,
                    content_type="lost_report",
                    item_type=report.item_type,
                    description=report.description,
                    location=report.location,
                    date=report.lost_date,
                    contact=report.contact,
                    state=report.state.value,
                    pickup_conditions=None,
                    created_at=report.created_at,
                    updated_at=report.updated_at,
                )
            )

    # ---------------------------------------------------------
    # Found Announcements
    # ---------------------------------------------------------

    if content_type in (None, "found_announcement"):
        result = await db.execute(
            select(FoundAnnouncement)
            .where(
                FoundAnnouncement.deleted_at.is_(None),
                FoundAnnouncement.state.in_(
                    (
                        FoundAnnouncementState.DELIVERED,
                        FoundAnnouncementState.CLOSED,
                    )
                ),
            )
        )

        announcements = result.scalars().all()

        for announcement in announcements:
            history_items.append(
                HistoryItemResponse(
                    id=announcement.id,
                    content_type="found_announcement",
                    item_type=announcement.item_type,
                    description=announcement.description,
                    location=announcement.location,
                    date=announcement.found_date,
                    contact=announcement.contact,
                    state=announcement.state.value,
                    pickup_conditions=announcement.pickup_conditions,
                    created_at=announcement.created_at,
                    updated_at=announcement.updated_at,
                )
            )

    # ---------------------------------------------------------
    # Sort
    # ---------------------------------------------------------

    history_items.sort(
        key=lambda item: item.updated_at,
        reverse=True,
    )

    # ---------------------------------------------------------
    # Pagination
    # ---------------------------------------------------------

    return history_items[skip : skip + limit]