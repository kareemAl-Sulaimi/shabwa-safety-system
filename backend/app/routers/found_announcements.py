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
from app.models.found_announcement import (
    FoundAnnouncement,
    FoundAnnouncementState,
)
from app.models.historical_record import (
    HistoricalRecord,
    ContentType,
)
from app.schemas.found_announcement import (
    FoundAnnouncementCreate,
    FoundAnnouncementResponse,
    FoundAnnouncementUpdate,
)


router = APIRouter()


# ---------------------------------------------------------
# Create
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=FoundAnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_found_announcement(
    announcement_data: FoundAnnouncementCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new found announcement."""

    announcement = FoundAnnouncement(
        user_id=current_user.id,
        item_type=announcement_data.item_type,
        description=announcement_data.description,
        location=announcement_data.location,
        found_date=announcement_data.found_date,
        contact=announcement_data.contact,
        pickup_conditions=announcement_data.pickup_conditions,
        state=FoundAnnouncementState.ACTIVE,
    )

    db.add(announcement)

    await db.commit()
    await db.refresh(announcement)

    return announcement


# ---------------------------------------------------------
# Get active announcements
# ---------------------------------------------------------

@router.get(
    "/",
    response_model=list[FoundAnnouncementResponse],
)
async def get_found_announcements(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """
    Get active found announcements.

    Only ACTIVE announcements belong to Updates.
    """

    result = await db.execute(
        select(FoundAnnouncement)
        .where(
            FoundAnnouncement.deleted_at.is_(None),
            FoundAnnouncement.state == FoundAnnouncementState.ACTIVE,
        )
        .order_by(FoundAnnouncement.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()


# ---------------------------------------------------------
# Get single announcement
# ---------------------------------------------------------

@router.get(
    "/{announcement_id}",
    response_model=FoundAnnouncementResponse,
)
async def get_found_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific active found announcement."""

    result = await db.execute(
        select(FoundAnnouncement).where(
            FoundAnnouncement.id == announcement_id,
            FoundAnnouncement.deleted_at.is_(None),
            FoundAnnouncement.state == FoundAnnouncementState.ACTIVE,
        )
    )

    announcement = result.scalar_one_or_none()

    if not announcement:
        raise NotFoundException(
            "Found announcement",
            str(announcement_id),
        )

    return announcement


# ---------------------------------------------------------
# Update announcement
# ---------------------------------------------------------

@router.patch(
    "/{announcement_id}",
    response_model=FoundAnnouncementResponse,
)
async def update_found_announcement(
    announcement_id: int,
    announcement_data: FoundAnnouncementUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an active found announcement."""

    result = await db.execute(
        select(FoundAnnouncement).where(
            FoundAnnouncement.id == announcement_id,
            FoundAnnouncement.deleted_at.is_(None),
        )
    )

    announcement = result.scalar_one_or_none()

    if not announcement:
        raise NotFoundException(
            "Found announcement",
            str(announcement_id),
        )

    if (
        announcement.user_id != current_user.id
        and current_user.role.value != "ADMIN"
    ):
        raise ForbiddenException(
            "You don't have permission to update this announcement"
        )

    # State changes must use dedicated endpoints.
    for field, value in announcement_data.model_dump(
        exclude_unset=True
    ).items():
        if field == "state":
            continue

        setattr(announcement, field, value)

    await db.commit()
    await db.refresh(announcement)

    return announcement


# ---------------------------------------------------------
# Mark as delivered
# ---------------------------------------------------------

@router.post(
    "/{announcement_id}/deliver",
    response_model=FoundAnnouncementResponse,
)
async def mark_as_delivered(
    announcement_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a found announcement as DELIVERED.

    ACTIVE -> DELIVERED

    The announcement immediately leaves Updates
    and becomes visible in History.
    """

    result = await db.execute(
        select(FoundAnnouncement).where(
            FoundAnnouncement.id == announcement_id,
            FoundAnnouncement.deleted_at.is_(None),
        )
    )

    announcement = result.scalar_one_or_none()

    if not announcement:
        raise NotFoundException(
            "Found announcement",
            str(announcement_id),
        )

    if announcement.user_id != current_user.id:
        raise ForbiddenException(
            "You don't have permission to update this announcement"
        )

    if announcement.state != FoundAnnouncementState.ACTIVE:
        raise StateTransitionException(
            "Only active announcements can be marked as delivered"
        )

    previous_state = announcement.state.value

    announcement.state = FoundAnnouncementState.DELIVERED

    history_record = HistoricalRecord(
        content_type=ContentType.FOUND_ANNOUNCEMENT,
        found_announcement_id=announcement.id,
        previous_state=previous_state,
        new_state=FoundAnnouncementState.DELIVERED.value,
        reason="marked_as_delivered",
    )

    db.add(history_record)

    await db.commit()
    await db.refresh(announcement)

    return announcement


# ---------------------------------------------------------
# Close announcement
# ---------------------------------------------------------

@router.post(
    "/{announcement_id}/close",
    response_model=FoundAnnouncementResponse,
)
async def close_found_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Close a found announcement.

    ACTIVE -> CLOSED

    The announcement immediately leaves Updates
    and becomes visible in History.
    """

    result = await db.execute(
        select(FoundAnnouncement).where(
            FoundAnnouncement.id == announcement_id,
            FoundAnnouncement.deleted_at.is_(None),
        )
    )

    announcement = result.scalar_one_or_none()

    if not announcement:
        raise NotFoundException(
            "Found announcement",
            str(announcement_id),
        )

    if announcement.user_id != current_user.id:
        raise ForbiddenException(
            "You don't have permission to close this announcement"
        )

    if announcement.state != FoundAnnouncementState.ACTIVE:
        raise StateTransitionException(
            "Only active announcements can be closed"
        )

    previous_state = announcement.state.value

    announcement.state = FoundAnnouncementState.CLOSED

    history_record = HistoricalRecord(
        content_type=ContentType.FOUND_ANNOUNCEMENT,
        found_announcement_id=announcement.id,
        previous_state=previous_state,
        new_state=FoundAnnouncementState.CLOSED.value,
        reason="closed",
    )

    db.add(history_record)

    await db.commit()
    await db.refresh(announcement)

    return announcement