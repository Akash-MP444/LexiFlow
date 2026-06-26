from typing import List

from pydantic import BaseModel, Field


class KeyPointsRequest(BaseModel):
    text: str = Field(..., min_length=1)


class KeyPointsResponse(BaseModel):
    key_points: List[str]
