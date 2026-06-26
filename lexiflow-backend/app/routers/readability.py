from fastapi import APIRouter

from app.schemas.readability import ReadabilityRequest, ReadabilityResponse
from app.services.readability_service import score_readability
from app.utils.validation import validate_text_length

router = APIRouter(tags=["readability"])


@router.post("/readability", response_model=ReadabilityResponse)
def readability(payload: ReadabilityRequest) -> ReadabilityResponse:
    validate_text_length(payload.text)
    result = score_readability(payload.text)
    return ReadabilityResponse(**result)
