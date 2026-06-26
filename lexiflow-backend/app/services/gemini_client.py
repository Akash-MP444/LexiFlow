"""
Thin wrapper around google-generativeai. Every call asks Gemini for
application/json output directly (no manual "return only JSON" prompt
engineering needed) and parses the result into a dict.

Per the plan's risk analysis: if Gemini returns malformed JSON despite the
response_mime_type constraint, retry once, then raise a clear error so the
router can return a clean 502 instead of crashing.
"""
import json
import logging
from functools import lru_cache
from typing import Any, Dict

import google.generativeai as genai

from app.config import get_settings

logger = logging.getLogger("lexiflow.gemini")


class GeminiError(Exception):
    """Raised when Gemini cannot produce usable JSON after retrying."""


@lru_cache
def _get_model():
    settings = get_settings()
    if not settings.gemini_api_key:
        raise GeminiError(
            "GEMINI_API_KEY is not configured on the server. "
            "Set it in your .env file (see .env.example)."
        )
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def _extract_json_text(response: Any) -> str:
    """Gemini's response.text is usually the raw JSON string, but we defend
    against stray markdown fences just in case a model variant adds them."""
    raw = (response.text or "").strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    return raw


def call_gemini(system_prompt: str, *, max_retries: int = 1) -> Dict[str, Any]:
    """
    Calls Gemini with a single combined prompt (system instructions + task
    text are already merged into `system_prompt` by the caller) and forces
    structured JSON output via response_mime_type.

    Retries once on malformed JSON / transient API errors, then raises
    GeminiError so the route layer can fail cleanly with a 502.
    """
    model = _get_model()
    last_error: Exception | None = None

    for attempt in range(max_retries + 1):
        try:
            response = model.generate_content(
                system_prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            raw = _extract_json_text(response)
            if not raw:
                raise GeminiError("Gemini returned an empty response.")
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            last_error = exc
            logger.warning("Gemini returned malformed JSON (attempt %s): %s", attempt + 1, exc)
        except Exception as exc:  # noqa: BLE001 - genuinely want to retry on anything transient
            last_error = exc
            logger.warning("Gemini call failed (attempt %s): %s", attempt + 1, exc)

    raise GeminiError(f"Gemini did not return usable JSON after {max_retries + 1} attempt(s): {last_error}")
