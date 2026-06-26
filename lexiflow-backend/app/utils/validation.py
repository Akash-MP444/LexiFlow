"""Small shared helpers used by multiple routers."""
from fastapi import HTTPException, status

from app.config import get_settings


def validate_text_length(text: str) -> None:
    """
    Guards against runaway Gemini token cost / abuse. Raises a 413 if the
    text exceeds MAX_TEXT_CHARS. Kept here rather than in Pydantic so the
    limit is configurable via .env without redeploying schema changes.
    """
    settings = get_settings()
    if len(text) > settings.max_text_chars:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"Text is too long ({len(text)} characters). "
                f"Limit is {settings.max_text_chars} characters per request."
            ),
        )
