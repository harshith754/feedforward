from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
from enum import Enum
from app.database import Base

# --- ENUMS ---

class UserRole(str, Enum):
    manager = "manager"
    developer = "developer"

class FeedbackSentiment(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

# --- MODELS ---

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Self-referencing manager relationship
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    manager = relationship("User", remote_side=[id], back_populates="team_members")
    team_members = relationship("User", back_populates="manager")

    # Feedback relationships
    given_feedback = relationship("Feedback", foreign_keys="Feedback.manager_id", back_populates="manager")
    received_feedback = relationship("Feedback", foreign_keys="Feedback.employee_id", back_populates="employee")

    # Average rating from feedback
    @hybrid_property
    def average_rating(self):
        if not self.received_feedback:
            return None
        total = sum(f.rating for f in self.received_feedback if f.rating is not None)
        count = len([f for f in self.received_feedback if f.rating is not None])
        return round(total / count, 2) if count > 0 else None


class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    strengths = Column(Text, nullable=False)
    areas_to_improve = Column(Text, nullable=False)
    overall_sentiment = Column(SQLEnum(FeedbackSentiment), nullable=False)
    
    rating = Column(Integer, nullable=False)  # rating from 1–5

    is_acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    manager = relationship("User", foreign_keys=[manager_id], back_populates="given_feedback")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="received_feedback")
