from fastapi import APIRouter

from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["summary"])


@router.post("/summary", response_model=SummaryResponse)
def summary(payload: SummaryRequest) -> SummaryResponse:
    validate_text_length(payload.text)
    result = ai_tasks.generate_summary(payload.text)
    return SummaryResponse(**result)
