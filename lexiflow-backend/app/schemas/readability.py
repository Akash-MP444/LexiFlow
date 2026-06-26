from pydantic import BaseModel, Field


class ReadabilityRequest(BaseModel):
    text: str = Field(..., min_length=1)


class ReadabilityResponse(BaseModel):
    flesch_kincaid_grade: float
    dale_chall_score: float
    suggested_level: str
