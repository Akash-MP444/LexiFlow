from fastapi import APIRouter

from app.schemas.quiz import QuizRequest, QuizResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["quiz"])


@router.post("/quiz", response_model=QuizResponse)
def quiz(payload: QuizRequest) -> QuizResponse:
    validate_text_length(payload.text)
    result = ai_tasks.generate_quiz(payload.text)
    return QuizResponse(**result)
