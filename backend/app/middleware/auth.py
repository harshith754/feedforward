from fastapi import Request, HTTPException, Depends
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import config, models
from app.database import get_db

def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

def get_manager_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can perform this action")
    return current_user

def get_developer_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.role != "developer":
        raise HTTPException(status_code=403, detail="Only developers can perform this action")
    return current_user
