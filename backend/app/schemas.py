from pydantic import BaseModel

from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    manager_id: Optional[int] = None


class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    manager_id: Optional[int]

    class Config:
        orm_mode = True
