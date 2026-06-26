from typing import Optional

from pydantic import BaseModel, Field


class WhyConfusedRequest(BaseModel):
    selected_text: str = Field(..., min_length=1)
    surrounding_context: str = Field(default="", description="Surrounding text for context resolution")


class WhyConfusedResponse(BaseModel):
    difficult_word: Optional[str] = None
    meaning: str
    simple_explanation: str
