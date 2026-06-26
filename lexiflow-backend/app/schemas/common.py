"""Shared schemas used across multiple routers."""
from pydantic import BaseModel, Field


class TextRequest(BaseModel):
    """Base shape for the simple { "text": string } endpoints."""

    text: str = Field(..., min_length=1, description="Source text to process")


class ErrorResponse(BaseModel):
    detail: str
