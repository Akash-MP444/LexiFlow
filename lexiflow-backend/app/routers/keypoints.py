from fastapi import APIRouter

from app.schemas.keypoints import KeyPointsRequest, KeyPointsResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["key-points"])


@router.post("/key-points", response_model=KeyPointsResponse)
def key_points(payload: KeyPointsRequest) -> KeyPointsResponse:
    validate_text_length(payload.text)
    result = ai_tasks.extract_key_points(payload.text)
    return KeyPointsResponse(**result)
