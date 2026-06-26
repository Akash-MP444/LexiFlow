from fastapi import APIRouter

from app.schemas.confused import WhyConfusedRequest, WhyConfusedResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["why-confused"])


@router.post("/why-confused", response_model=WhyConfusedResponse)
def why_confused(payload: WhyConfusedRequest) -> WhyConfusedResponse:
    validate_text_length(payload.selected_text)
    if payload.surrounding_context:
        validate_text_length(payload.surrounding_context)
    result = ai_tasks.explain_confusion(payload.selected_text, payload.surrounding_context)
    return WhyConfusedResponse(**result)
