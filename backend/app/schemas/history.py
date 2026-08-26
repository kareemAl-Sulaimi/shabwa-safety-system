from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class HistoryItemResponse(BaseModel):
    """
    User-facing History item.

    This is a unified representation of both:
    - Lost reports
    - Found announcements
    """

    id: int
    content_type: str

    item_type: str
    description: str
    location: str
    date: datetime
    contact: str

    state: str

    pickup_conditions: Optional[str] = None

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True