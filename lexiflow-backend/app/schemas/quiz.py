from typing import List

from pydantic import BaseModel, Field, field_validator


class QuizRequest(BaseModel):
    text: str = Field(..., min_length=1)


class QuizQuestion(BaseModel):
    question: str
    choices: List[str]
    answer_index: int

    @field_validator("choices")
    @classmethod
    def must_have_four_choices(cls, v: List[str]) -> List[str]:
        if len(v) != 4:
            raise ValueError("Each question must have exactly 4 choices")
        return v

    @field_validator("answer_index")
    @classmethod
    def answer_index_in_range(cls, v: int) -> int:
        if not 0 <= v <= 3:
            raise ValueError("answer_index must be between 0 and 3")
        return v


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]
