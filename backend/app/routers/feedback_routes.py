# --- feedback/routes.py ---
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.middleware.auth import get_current_user
from app import models
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate, FeedbackAcknowledge, FeedbackOut, GiverInfo
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

# Create feedback (manager or developer can give feedback to anyone)
@router.post("/create", response_model=FeedbackOut)
def create_feedback(
    data: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target_user = db.query(models.User).filter(models.User.id == data.target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    feedback = models.Feedback(
        giver_id=current_user.id,
        receiver_id=data.target_user_id,
        strengths=data.strengths,
        areas_to_improve=data.areas_to_improve,
        overall_sentiment=data.overall_sentiment,
        rating=data.rating
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    # Manually build FeedbackOut dict to include giver info
    feedback_dict = {
        "id": feedback.id,
        "giver_id": feedback.giver_id,
        "receiver_id": feedback.receiver_id,
        "strengths": feedback.strengths,
        "areas_to_improve": feedback.areas_to_improve,
        "overall_sentiment": feedback.overall_sentiment,
        "rating": feedback.rating,
        "is_acknowledged": feedback.is_acknowledged,
        "acknowledged_at": feedback.acknowledged_at.isoformat() if feedback.acknowledged_at else None,
        "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
        "giver": {
            "id": current_user.id,
            "full_name": current_user.full_name
        }
    }
    return feedback_dict

# Update feedback
@router.put("/update", response_model=FeedbackOut)
def update_feedback(
    data: FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == data.feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.giver_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update feedback you gave")

    if data.strengths is not None:
        feedback.strengths = data.strengths
    if data.areas_to_improve is not None:
        feedback.areas_to_improve = data.areas_to_improve
    if data.overall_sentiment is not None:
        feedback.overall_sentiment = data.overall_sentiment
    if data.rating is not None:
        feedback.rating = data.rating

    db.commit()
    db.refresh(feedback)
    return feedback

# Acknowledge feedback
@router.post("/acknowledge")
def acknowledge_feedback(
    data: FeedbackAcknowledge,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    feedback = db.query(models.Feedback).filter(models.Feedback.id == data.feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    if feedback.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only acknowledge feedback given to you")

    if feedback.is_acknowledged:
        return {"message": "Already acknowledged"}

    feedback.is_acknowledged = True
    feedback.acknowledged_at = datetime.utcnow()
    db.commit()
    return {"message": "Feedback acknowledged"}

# Get feedback received
@router.get("/received", response_model=List[FeedbackOut])
def get_received_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    feedbacks = db.query(models.Feedback).options(joinedload(models.Feedback.giver)).filter(models.Feedback.receiver_id == current_user.id).all()
    result = []
    for fb in feedbacks:
        feedback_dict = {
            "id": fb.id,
            "giver_id": fb.giver_id,
            "receiver_id": fb.receiver_id,
            "strengths": fb.strengths,
            "areas_to_improve": fb.areas_to_improve,
            "overall_sentiment": fb.overall_sentiment,
            "rating": fb.rating,
            "is_acknowledged": fb.is_acknowledged,
            "acknowledged_at": fb.acknowledged_at.isoformat() if fb.acknowledged_at else None,
            "created_at": fb.created_at.isoformat() if fb.created_at else None,
            "giver": {
                "id": fb.giver.id if fb.giver else None,
                "full_name": fb.giver.full_name if fb.giver else "Unknown"
            }
        }
        result.append(feedback_dict)
    return result

# Get feedback given
@router.get("/given", response_model=List[FeedbackOut])
def get_given_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    feedbacks = db.query(models.Feedback).filter(models.Feedback.giver_id == current_user.id).all()
    return feedbacks

# Get feedback history for a specific user (manager only)
@router.get("/history/{user_id}", response_model=List[FeedbackOut])
def get_feedback_history_for_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view feedback history for users.")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only view feedback for your own team members.")
    feedbacks = db.query(models.Feedback).options(joinedload(models.Feedback.giver)).filter(models.Feedback.receiver_id == user_id).all()
    result = []
    for fb in feedbacks:
        # Build FeedbackOut dict manually to avoid from_orm issues with .giver
        feedback_dict = {
            "id": fb.id,
            "giver_id": fb.giver_id,
            "receiver_id": fb.receiver_id,
            "strengths": fb.strengths,
            "areas_to_improve": fb.areas_to_improve,
            "overall_sentiment": fb.overall_sentiment,
            "rating": fb.rating,
            "is_acknowledged": fb.is_acknowledged,
            "acknowledged_at": fb.acknowledged_at.isoformat() if fb.acknowledged_at else None,
            "created_at": fb.created_at.isoformat() if fb.created_at else None,
            "giver": {
                "id": fb.giver.id if fb.giver else None,
                "full_name": fb.giver.full_name if fb.giver else "Unknown"
            }
        }
        result.append(feedback_dict)
    return result
