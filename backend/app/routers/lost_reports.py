from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    StateTransitionException,
)
from app.core.security import get_current_active_user
from app.models.user import User
from app.models.lost_report import LostReport, LostReportState
from app.models.historical_record import (
    HistoricalRecord,
    ContentType,
)
from app.schemas.lost_report import (
    LostReportCreate,
    LostReportResponse,
    LostReportUpdate,
)


router = APIRouter()


# ---------------------------------------------------------
# Create
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=LostReportResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_lost_report(
    report_data: LostReportCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new lost report."""

    report = LostReport(
        user_id=current_user.id,
        item_type=report_data.item_type,
        description=report_data.description,
        location=report_data.location,
        lost_date=report_data.lost_date,
        contact=report_data.contact,
        state=LostReportState.ACTIVE,
    )

    db.add(report)

    await db.commit()
    await db.refresh(report)

    return report


# ---------------------------------------------------------
# Get active lost reports
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[LostReportResponse],
)
async def get_lost_reports(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """
    Get active lost reports.

    Only ACTIVE reports belong to Updates.
    """

    result = await db.execute(
        select(LostReport)
        .where(
            LostReport.deleted_at.is_(None),
            LostReport.state == LostReportState.ACTIVE,
        )
        .order_by(LostReport.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()


# ---------------------------------------------------------
# Get single report
# ---------------------------------------------------------

@router.get(
    "/{report_id}",
    response_model=LostReportResponse,
)
async def get_lost_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific active lost report."""

    result = await db.execute(
        select(LostReport).where(
            LostReport.id == report_id,
            LostReport.deleted_at.is_(None),
            LostReport.state == LostReportState.ACTIVE,
        )
    )

    report = result.scalar_one_or_none()

    if not report:
        raise NotFoundException(
            "Lost report",
            str(report_id),
        )

    return report


# ---------------------------------------------------------
# Update report data
# ---------------------------------------------------------

@router.patch(
    "/{report_id}",
    response_model=LostReportResponse,
)
async def update_lost_report(
    report_id: int,
    report_data: LostReportUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an active lost report."""

    result = await db.execute(
        select(LostReport).where(
            LostReport.id == report_id,
            LostReport.deleted_at.is_(None),
        )
    )

    report = result.scalar_one_or_none()

    if not report:
        raise NotFoundException(
            "Lost report",
            str(report_id),
        )

    if (
        report.user_id != current_user.id
        and current_user.role.value != "ADMIN"
    ):
        raise ForbiddenException(
            "You don't have permission to update this report"
        )

    # State changes must use dedicated endpoints.
    for field, value in report_data.model_dump(
        exclude_unset=True
    ).items():
        if field == "state":
            continue

        setattr(report, field, value)

    await db.commit()
    await db.refresh(report)

    return report


# ---------------------------------------------------------
# Mark as found
# ---------------------------------------------------------

@router.post(
    "/{report_id}/found",
    response_model=LostReportResponse,
)
async def mark_as_found(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a lost report as FOUND.

    ACTIVE -> FOUND

    The report immediately leaves Updates
    and becomes visible in History.
    """

    result = await db.execute(
        select(LostReport).where(
            LostReport.id == report_id,
            LostReport.deleted_at.is_(None),
        )
    )

    report = result.scalar_one_or_none()

    if not report:
        raise NotFoundException(
            "Lost report",
            str(report_id),
        )

    if report.user_id != current_user.id:
        raise ForbiddenException(
            "You don't have permission to update this report"
        )

    if report.state != LostReportState.ACTIVE:
        raise StateTransitionException(
            "Only active reports can be marked as found"
        )

    previous_state = report.state.value

    report.state = LostReportState.FOUND

    history_record = HistoricalRecord(
        content_type=ContentType.LOST_REPORT,
        lost_report_id=report.id,
        previous_state=previous_state,
        new_state=LostReportState.FOUND.value,
        reason="marked_as_found",
    )

    db.add(history_record)

    await db.commit()
    await db.refresh(report)

    return report


# ---------------------------------------------------------
# Close report
# ---------------------------------------------------------

@router.post(
    "/{report_id}/close",
    response_model=LostReportResponse,
)
async def close_lost_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Close a lost report.

    ACTIVE -> CLOSED

    The report immediately leaves Updates
    and becomes visible in History.
    """

    result = await db.execute(
        select(LostReport).where(
            LostReport.id == report_id,
            LostReport.deleted_at.is_(None),
        )
    )

    report = result.scalar_one_or_none()

    if not report:
        raise NotFoundException(
            "Lost report",
            str(report_id),
        )

    if report.user_id != current_user.id:
        raise ForbiddenException(
            "You don't have permission to close this report"
        )

    if report.state != LostReportState.ACTIVE:
        raise StateTransitionException(
            "Only active reports can be closed"
        )

    previous_state = report.state.value

    report.state = LostReportState.CLOSED

    history_record = HistoricalRecord(
        content_type=ContentType.LOST_REPORT,
        lost_report_id=report.id,
        previous_state=previous_state,
        new_state=LostReportState.CLOSED.value,
        reason="closed",
    )

    db.add(history_record)

    await db.commit()
    await db.refresh(report)

    return report