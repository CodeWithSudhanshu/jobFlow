from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers.jobs import router as job_router
from src.routers.resume import router as resume_router
from src.routers.auth import router as auth_router


app = FastAPI(
    title="Job Application Tracker API",
    description="Backend API for managing job applications, resume ATS scoring, and user authentication.",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://job-flow-amber.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routes
app.include_router(job_router)
app.include_router(resume_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Job Application Tracker API is running."
    }