from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.user import router as users_router
from app.routers.lost_reports import router as lost_reports_router
from app.routers.found_announcements import router as found_announcements_router
from app.routers.history import router as history_router
from app.routers.admin import router as admin_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(lost_reports_router, prefix="/lost-reports", tags=["Lost Reports"])
api_router.include_router(found_announcements_router, prefix="/found-announcements", tags=["Found Announcements"])
api_router.include_router(history_router, prefix="/history", tags=["History"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])