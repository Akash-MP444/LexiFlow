from fastapi import APIRouter

from app.schemas.dyslexia import DyslexiaRewriteRequest, DyslexiaRewriteResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["dyslexia"])


@router.post("/dyslexia-rewrite", response_model=DyslexiaRewriteResponse)
def dyslexia_rewrite(payload: DyslexiaRewriteRequest) -> DyslexiaRewriteResponse:
    validate_text_length(payload.text)
    result = ai_tasks.dyslexia_rewrite(payload.text)
    return DyslexiaRewriteResponse(**result)
