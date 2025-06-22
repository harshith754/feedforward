import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth_routes,user_routes

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

print(f"Allowed origins: {origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 👇 Register auth routes
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
