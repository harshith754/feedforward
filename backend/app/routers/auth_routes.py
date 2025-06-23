from app.services import auth
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
from app.middleware.auth import get_current_user
from app.schemas import user
import os

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=user.UserOut)
def register(user: user.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    if user.manager_id:
        manager = db.query(models.User).filter(models.User.id == user.manager_id, models.User.role == "manager").first()
        if not manager:
            raise HTTPException(status_code=400, detail="Manager not found")

    created = auth.create_user(user, db)
    return created


@router.post("/login")
def login(user: user.UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = auth.authenticate_user(user.username, user.password, db)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = auth.create_jwt_token(db_user)

    # Set cookie flags based on environment for local dev and production
    is_prod = os.getenv("ENV", "dev").lower() == "prod"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_prod,  # True in production (HTTPS), False locally
        samesite="none" if is_prod else "lax",  # 'none' for cross-site, 'lax' for local
        max_age=60 * 60 * 24,
        path="/"
    )

    return {"message": "Login successful"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=user.UserOut)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """
    Returns the currently logged-in user's profile.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return current_user