from app.services import auth
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
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
def login(user: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    db_user = auth.authenticate_user(user.username, user.password, db)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = auth.create_jwt_token(db_user)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24,
        path="/"
    )

    return {"message": "Login successful"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """
    Returns the currently logged-in user's profile.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return current_user