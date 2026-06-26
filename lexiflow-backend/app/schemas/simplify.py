from typing import Literal

from pydantic import BaseModel, Field

SimplifyLevel = Literal["simplified", "very_simple", "eli5"]


class SimplifyRequest(BaseModel):
    text: str = Field(..., min_length=1)
    level: SimplifyLevel = "simplified"


class SimplifyResponse(BaseModel):
    simplified_text: str
    reading_time_sec: int
