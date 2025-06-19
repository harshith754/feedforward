from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta

from app import models, schemas, config
from app.database import SessionLocal
from app.utils.security import hash_password,verify_password
from fastapi import HTTPException, status

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_user(user: schemas.UserCreate, db: Session):
    if user.manager_id is not None:
        manager = db.query(models.User).filter(models.User.id == user.manager_id).first()
        if not manager:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Manager with given ID does not exist"
            )
        if manager.role != "manager":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned manager_id does not belong to a user with role 'manager'"
            )

    hashed = hash_password(user.password)
    new_user = models.User(
        username=user.username,
        hashed_password=hashed,
        role=user.role,
        manager_id=user.manager_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(username: str, password: str, db: Session):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def create_jwt_token(user: models.User):
    payload = {
        "sub": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)
