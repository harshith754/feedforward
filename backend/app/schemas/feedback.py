from pydantic import BaseModel, Field, validator
from enum import Enum
from typing import Optional
from datetime import datetime

class FeedbackSentiment(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class FeedbackCreate(BaseModel):
    target_user_id: int
    strengths: str
    areas_to_improve: str
    overall_sentiment: FeedbackSentiment
    rating: int = Field(..., ge=1, le=5)

class FeedbackUpdate(BaseModel):
    feedback_id: int
    strengths: Optional[str] = None
    areas_to_improve: Optional[str] = None
    overall_sentiment: Optional[FeedbackSentiment] = None
    rating: Optional[int] = Field(None, ge=1, le=5)

class FeedbackAcknowledge(BaseModel):
    feedback_id: int

class GiverInfo(BaseModel):
    id: int | None = None
    full_name: str | None = None

class FeedbackOut(BaseModel):
    id: int
    giver_id: int
    receiver_id: int
    strengths: str
    areas_to_improve: str
    overall_sentiment: FeedbackSentiment
    rating: int
    is_acknowledged: bool
    acknowledged_at: Optional[str]
    created_at: str
    giver: Optional[GiverInfo] = None  # Add this field

    class Config:
        orm_mode = True

    @validator("created_at", "acknowledged_at", pre=True, always=True)
    def convert_datetime(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

