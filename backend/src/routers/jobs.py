from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.schemas.job import Job
from src.database.connection import SessionLocal
from src.database.models import Job as JobModel
from src.auth import get_current_user

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# GET ALL JOBS
# =========================

@router.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    jobs = (
        db.query(JobModel)
        .filter(JobModel.user_id == current_user.id)
        .all()
    )

    return {
        "total_jobs": len(jobs),
        "jobs": [
            {
                "id": job.id,
                "company": job.company,
                "role": job.role,
                "location": job.location,
                "salary": job.salary,
                "status": job.status
            }
            for job in jobs
        ]
    }


# =========================
# GET SINGLE JOB
# =========================

@router.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    job = (
        db.query(JobModel)
        .filter(
            JobModel.id == job_id,
            JobModel.user_id == current_user.id
        )
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=404,
            detail="Job application not found."
        )

    return {
        "id": job.id,
        "company": job.company,
        "role": job.role,
        "location": job.location,
        "salary": job.salary,
        "status": job.status
    }


# =========================
# CREATE JOB
# =========================

@router.post("/jobs")
def create_job(
    job: Job,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    new_job = JobModel(
        company=job.company,
        role=job.role,
        location=job.location,
        salary=job.salary,
        status=job.status,
        user_id=current_user.id
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {
        "message": "Job added successfully.",
        "id": new_job.id,
        "company": new_job.company,
        "role": new_job.role,
        "location": new_job.location,
        "salary": new_job.salary,
        "status": new_job.status
    }


# =========================
# UPDATE JOB
# =========================

@router.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    job: Job,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing_job = (
        db.query(JobModel)
        .filter(
            JobModel.id == job_id,
            JobModel.user_id == current_user.id
        )
        .first()
    )

    if existing_job is None:
        raise HTTPException(
            status_code=404,
            detail="Job application not found."
        )

    existing_job.company = job.company
    existing_job.role = job.role
    existing_job.location = job.location
    existing_job.salary = job.salary
    existing_job.status = job.status

    db.commit()
    db.refresh(existing_job)

    return {
        "message": "Job updated successfully.",
        "id": existing_job.id,
        "company": existing_job.company,
        "role": existing_job.role,
        "location": existing_job.location,
        "salary": existing_job.salary,
        "status": existing_job.status
    }


# =========================
# DELETE JOB
# =========================

@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing_job = (
        db.query(JobModel)
        .filter(
            JobModel.id == job_id,
            JobModel.user_id == current_user.id
        )
        .first()
    )

    if existing_job is None:
        raise HTTPException(
            status_code=404,
            detail="Job application not found."
        )

    db.delete(existing_job)
    db.commit()

    return {
        "message": "Job deleted successfully.",
        "id": job_id
    }