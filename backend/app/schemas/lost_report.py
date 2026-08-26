from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class LostReportCreate(BaseModel):
    item_type: str = Field(..., max_length=100)
    description: str = Field(..., min_length=1)
    location: str = Field(..., max_length=255)
    lost_date: datetime
    contact: str = Field(..., max_length=100)


class LostReportResponse(BaseModel):
    id: int
    user_id: int
    item_type: str
    description: str
    location: str
    lost_date: datetime
    contact: str
    state: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LostReportUpdate(BaseModel):
    item_type: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, min_length=1)
    location: Optional[str] = Field(None, max_length=255)
    lost_date: Optional[datetime] = None
    contact: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = None