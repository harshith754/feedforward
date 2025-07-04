from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str
    manager_id: Optional[int] = None


class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    manager_id: Optional[int]

    class Config:
        orm_mode = True