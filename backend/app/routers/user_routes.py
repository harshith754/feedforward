from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.middleware.auth import get_current_user, get_manager_user

router = APIRouter(prefix="/api/users", tags=["User Management"])

# Assign self as manager to a developer (only if you're a manager)
@router.put("/{user_id}/assign-manager")
def assign_self_as_manager(
    user_id: int = Path(..., description="ID of the developer"),
    manager_user: models.User = Depends(get_manager_user),
    db: Session = Depends(get_db),
):
    dev = db.query(models.User).filter(models.User.id == user_id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="User not found.")
    if dev.role != "developer":
        raise HTTPException(status_code=400, detail="Target user must be a developer.")

    dev.manager_id = manager_user.id
    db.commit()
    db.refresh(dev)
    return {"message": f"{dev.username} is now managed by {manager_user.username}"}


# Reassign developer to a different manager (can be any manager)
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
    if dev.role != "developer":
        raise HTTPException(status_code=400, detail="Target user must be a developer.")
    if not new_manager or new_manager.role != "manager":
        raise HTTPException(status_code=400, detail="New manager must have role 'manager'.")

    dev.manager_id = new_manager.id
    db.commit()
    db.refresh(dev)
    return {"message": f"{dev.username} is now managed by {new_manager.username}"}


# Get team members for the currently logged-in manager
@router.get("/team")
def get_my_team(
    manager_user: models.User = Depends(get_manager_user),
    db: Session = Depends(get_db),
):
    team = db.query(models.User).filter(models.User.manager_id == manager_user.id).all()
    return [
        {
            "id": dev.id,
            "username": dev.username,
            "full_name": dev.full_name,
            "role": dev.role,
            "rating": dev.average_rating or 5
        }
        for dev in team
    ]


# Get my current manager (as a developer)
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

    return {
        "manager": {
            "id": manager.id,
            "username": manager.username,
            "full_name": manager.full_name,
            "rating": manager.average_rating or 5
        }
    }


# Get all users with their manager info (manager-only access)
@router.get("/all")
def get_all_users(
    manager_user: models.User = Depends(get_manager_user),
    db: Session = Depends(get_db),
):
    users = db.query(models.User).all()
    result = []

    for user in users:
        manager = (
            db.query(models.User)
            .filter(models.User.id == user.manager_id)
            .first()
            if user.manager_id
            else None
        )
        result.append({
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "rating": user.average_rating or 5,
            "manager": {
                "id": manager.id,
                "username": manager.username,
                "full_name": manager.full_name,
                "rating": manager.average_rating or 5
            } if manager else None
        })

    return result


# List all managers
@router.get("/managers")
def get_all_managers(db: Session = Depends(get_db)):
    managers = db.query(models.User).filter(models.User.role == "manager").all()
    return [
        {
            "id": m.id,
            "username": m.username,
            "full_name": m.full_name,
            "rating": m.average_rating or 5
        } for m in managers
    ]


# Fetch a single user by ID
@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    manager = (
        db.query(models.User)
        .filter(models.User.id == user.manager_id)
        .first()
        if user.manager_id else None
    )
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "rating": user.average_rating or 5,
        "manager": {
            "id": manager.id,
            "username": manager.username,
            "full_name": manager.full_name,
            "rating": manager.average_rating or 5
        } if manager else None
    }
