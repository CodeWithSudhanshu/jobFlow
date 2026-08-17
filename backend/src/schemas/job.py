from pydantic import BaseModel


class Job(BaseModel):
    company: str
    role: str
    location: str
    salary: str
    status: str