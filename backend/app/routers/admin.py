from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenException, NotFoundException
from app.core.security import get_current_active_user
from app.models.user import User, UserRole
from app.models.lost_report import LostReport
from app.models.found_announcement import FoundAnnouncement
from app.schemas.lost_report import LostReportResponse
from app.schemas.found_announcement import FoundAnnouncementResponse

from datetime import datetime

router = APIRouter()


async def require_admin(current_user: User) -> None:
    """Check if user has admin role."""
    if current_user.role.value != "ADMIN":
        raise ForbiddenException("Admin access required")


@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get admin dashboard statistics."""
    await require_admin(current_user)

    # Count total users
    result = await db.execute(select(User))
    total_users = len(result.scalars().all())

    # Count active lost reports
    result = await db.execute(select(LostReport).where(LostReport.deleted_at.is_(None)))
    total_lost_reports = len(result.scalars().all())

    # Count active found announcements
    result = await db.execute(select(FoundAnnouncement).where(FoundAnnouncement.deleted_at.is_(None)))
    total_found_announcements = len(result.scalars().all())

    return {
        "total_users": total_users,
        "total_lost_reports": total_lost_reports,
        "total_found_announcements": total_found_announcements,
    }


@router.get("/lost-reports", response_model=list[LostReportResponse])
async def admin_get_lost_reports(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Get all lost reports (including soft-deleted)."""
    await require_admin(current_user)

    result = await db.execute(
        select(LostReport)
        .order_by(LostReport.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/found-announcements", response_model=list[FoundAnnouncementResponse])
async def admin_get_found_announcements(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Get all found announcements (including soft-deleted)."""
    await require_admin(current_user)

    result = await db.execute(
        select(FoundAnnouncement)
        .order_by(FoundAnnouncement.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.delete("/lost-reports/{report_id}")
async def admin_soft_delete_lost_report(
    report_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Soft delete a lost report."""
    await require_admin(current_user)

    result = await db.execute(select(LostReport).where(LostReport.id == report_id))
    report = result.scalar_one_or_none()

    if not report:
        raise NotFoundException("Lost report", str(report_id))

    report.deleted_at = datetime.utcnow()
    await db.commit()

    return {"message": "Lost report soft deleted successfully"}


@router.delete("/found-announcements/{announcement_id}")
async def admin_soft_delete_found_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin: Soft delete a found announcement."""
    await require_admin(current_user)

    result = await db.execute(select(FoundAnnouncement).where(FoundAnnouncement.id == announcement_id))
    announcement = result.scalar_one_or_none()

    if not announcement:
        raise NotFoundException("Found announcement", str(announcement_id))

    announcement.deleted_at = datetime.utcnow()
    await db.commit()

    return {"message": "Found announcement soft deleted successfully"}