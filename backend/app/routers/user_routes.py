from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.middleware.auth import get_current_user, get_manager_user

router = APIRouter(prefix="/api/users", tags=["User Management"])

@router.put("/{user_id}/assign-manager")
def assign_manager(
    user_id: int = Path(..., description="ID of the developer"),
    manager_user: models.User = Depends(get_manager_user),
    db: Session = Depends(get_db),
):
    dev = db.query(models.User).filter(models.User.id == user_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="User not found.")
    if dev.role != "employee":
        raise HTTPException(status_code=400, detail="Target user must be an employee.")
    dev.manager_id = manager_user.id
    db.commit()
    db.refresh(dev)
    return {"message": f"{dev.username} is now managed by {manager_user.username}"}


@router.put("/{user_id}/change-manager/{new_manager_id}")
def change_manager(
    user_id: int,
    new_manager_id: int,
    manager_user: models.User = Depends(get_manager_user),
    db: Session = Depends(get_db),
):
    dev = db.query(models.User).filter(models.User.id == user_id).first()
    new_manager = db.query(models.User).filter(models.User.id == new_manager_id).first()

    if not dev:
        raise HTTPException(status_code=404, detail="User not found.")
    if dev.role != "employee":
        raise HTTPException(status_code=400, detail="Target user must be an employee.")
    if not new_manager or new_manager.role != "manager":
        raise HTTPException(status_code=400, detail="New manager must have role 'manager'.")

    dev.manager_id = new_manager.id
    db.commit()
    db.refresh(dev)
    return {"message": f"{dev.username} is now managed by {new_manager.username}"}

@router.get("/team")
def get_team(
    manager_user: models.User = Depends(get_manager_user),
    db: Session = Depends(get_db),
):
    team = db.query(models.User).filter(models.User.manager_id == manager_user.id).all()
    return [
        {"id": dev.id, "username": dev.username, "role": dev.role}
        for dev in team
    ]

@router.get("/manager")
def get_my_manager(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.manager_id is None:
        return {"manager": None}
    manager = db.query(models.User).filter(models.User.id == current_user.manager_id).first()
    if not manager:
        return {"manager": None}
    return {"manager": {"id": manager.id, "username": manager.username}}
  

@router.get("/managers")
def get_all_managers(db: Session = Depends(get_db)):
    """Return a list of all manager users."""
    managers = db.query(models.User).filter(models.User.role == "manager").all()
    return [{"id": m.id, "username": m.username} for m in managers]
