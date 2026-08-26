from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FoundAnnouncementCreate(BaseModel):
    item_type: str = Field(..., max_length=100)
    description: str = Field(..., min_length=1)
    location: str = Field(..., max_length=255)
    found_date: datetime
    contact: str = Field(..., max_length=100)
    pickup_conditions: str = Field(..., min_length=1)


class FoundAnnouncementResponse(BaseModel):
    id: int
    user_id: int
    item_type: str
    description: str
    location: str
    found_date: datetime
    contact: str
    pickup_conditions: str
    state: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FoundAnnouncementUpdate(BaseModel):
    item_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, min_length=1)
    location: Optional[str] = Field(None, max_length=255)
    found_date: Optional[datetime] = None
    contact: Optional[str] = Field(None, max_length=100)
    pickup_conditions: Optional[str] = Field(None, min_length=1)
    state: Optional[str] = None