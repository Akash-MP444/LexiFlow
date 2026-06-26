from fastapi import APIRouter

from app.schemas.simplify import SimplifyRequest, SimplifyResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["simplify"])


@router.post("/simplify", response_model=SimplifyResponse)
def simplify(payload: SimplifyRequest) -> SimplifyResponse:
    validate_text_length(payload.text)
    result = ai_tasks.simplify_text(payload.text, payload.level)
    return SimplifyResponse(**result)
