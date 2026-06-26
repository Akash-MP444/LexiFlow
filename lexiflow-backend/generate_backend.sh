#!/usr/bin/env bash
# generate_backend.sh
# Recreates the entire LexiFlow backend repository structure and files
# from scratch in the current directory. Safe to run in an empty folder.
set -euo pipefail

ROOT_DIR="lexiflow-backend"

echo "Creating LexiFlow backend at ./${ROOT_DIR} ..."

mkdir -p "${ROOT_DIR}/app/routers"
mkdir -p "${ROOT_DIR}/app/services"
mkdir -p "${ROOT_DIR}/app/schemas"
mkdir -p "${ROOT_DIR}/app/prompts"
mkdir -p "${ROOT_DIR}/app/utils"

cat > "${ROOT_DIR}/.env.example" << 'LEXIFLOW_EOF'
# Google AI Studio free-tier API key — never commit the real key
GEMINI_API_KEY=your_gemini_api_key_here

# Model name (kept configurable in case of future renames/deprecations)
GEMINI_MODEL=gemini-2.5-flash

# Comma-separated list of allowed frontend origins for CORS
# Example: CORS_ORIGINS=https://lexiflow.vercel.app,http://localhost:5173
CORS_ORIGINS=http://localhost:5173

# Max upload size for PDFs, in megabytes
MAX_PDF_SIZE_MB=15

# Max characters of input text accepted per request (guards against abuse / runaway token cost)
MAX_TEXT_CHARS=20000
LEXIFLOW_EOF

cat > "${ROOT_DIR}/README.md" << 'LEXIFLOW_EOF'
# LexiFlow API

Stateless FastAPI backend for LexiFlow. No database, no auth, no cloud
storage, no RAG — every endpoint is a pure function: request in, AI or
text-processing result out, nothing remembered between calls.

## Why this backend exists at all

Two reasons, even with zero persistence:

1. The Gemini API key must never ship inside the frontend bundle.
2. PDF parsing (PyMuPDF) and text processing belong server-side, not in a
   JS bundle shipped to a phone.

## Endpoints

| Route | Method | Purpose |
|---|---|---|
| `/api/extract-pdf` | POST | Extract text from an uploaded PDF (PyMuPDF) |
| `/api/readability` | POST | Flesch-Kincaid / Dale-Chall scoring (TextStat, no AI call) |
| `/api/simplify` | POST | Simplified / Very Simple / ELI5 rewrite (Gemini) |
| `/api/dyslexia-rewrite` | POST | Decoding-focused rewrite, independent of reading level (Gemini) |
| `/api/key-points` | POST | 3–5 key facts (Gemini) |
| `/api/summary` | POST | 2–3 sentence summary (Gemini) |
| `/api/quiz` | POST | 3-question multiple-choice comprehension quiz (Gemini) |
| `/api/why-confused` | POST | Explains a selected word/phrase using surrounding context (Gemini) |

Interactive docs are available at `/docs` once the server is running.

## Local setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and set GEMINI_API_KEY (free tier key from Google AI Studio)
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Point the frontend's
`VITE_API_BASE_URL` at this address.

## Environment variables

See `.env.example`. Key ones:

- `GEMINI_API_KEY` — required, from Google AI Studio (free tier)
- `GEMINI_MODEL` — defaults to `gemini-2.5-flash`
- `CORS_ORIGINS` — comma-separated list of allowed frontend origins
- `MAX_PDF_SIZE_MB` — upload size guard (default 15MB)
- `MAX_TEXT_CHARS` — per-request text length guard (default 20,000 chars)

## Deployment (Railway / Render)

1. Push this repo to GitHub.
2. Create a project from the repo, root directory `backend/`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set env vars: `GEMINI_API_KEY`, `CORS_ORIGINS` (your deployed frontend URL).
5. No database add-on — leave it off entirely.
6. Smoke-test all 8 endpoints against the live URL before depending on it
   in a demo.

## Project structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, CORS, router registration
│   ├── config.py                # env-driven settings
│   ├── routers/                 # one file per endpoint
│   ├── services/                 # gemini_client, ai_tasks, pdf_extractor, readability_service
│   ├── schemas/                  # pydantic request/response models, one file per resource
│   ├── prompts/                  # all Gemini prompt strings as constants
│   └── utils/                     # validation + global error handlers
├── requirements.txt
├── .env.example
├── generate_backend.sh           # recreates this entire repo from scratch
└── README.md
```

## Error handling philosophy

Every failure mode returns clean JSON, never a blank 500:

- Malformed Gemini JSON → retried once, then a `502` with a clear message.
- Bad/empty/oversized PDF → a `400` or `413` with a clear message.
- Text over the configured length limit → a `413`.
- Anything else unexpected → a generic `500`, logged server-side.
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/__init__.py" << 'LEXIFLOW_EOF'

LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/config.py" << 'LEXIFLOW_EOF'
"""
Centralized app configuration. Reads from environment variables / .env file.
No database, no auth — this is the only "settings layer" the app needs.
"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    cors_origins: str = "http://localhost:5173"
    max_pdf_size_mb: int = 15
    max_text_chars: int = 20000

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_pdf_size_bytes(self) -> int:
        return self.max_pdf_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/main.py" << 'LEXIFLOW_EOF'
"""
LexiFlow API — a pure stateless processing layer.

No database. No sessions. No auth. Every route is a self-contained function:
request in, AI/processing result out, nothing stored, nothing remembered
between requests. This is what makes "no database" actually fine here.
"""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import confused, dyslexia, keypoints, quiz, readability, simplify, summary, upload
from app.utils.error_handlers import register_error_handlers

logging.basicConfig(level=logging.INFO)

settings = get_settings()

app = FastAPI(
    title="LexiFlow API",
    description="Stateless reading-accessibility processing layer for LexiFlow.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(simplify.router, prefix="/api")
app.include_router(dyslexia.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(keypoints.router, prefix="/api")
app.include_router(confused.router, prefix="/api")
app.include_router(readability.router, prefix="/api")
app.include_router(upload.router, prefix="/api")


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "LexiFlow API"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/prompts/__init__.py" << 'LEXIFLOW_EOF'

LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/prompts/prompt_templates.py" << 'LEXIFLOW_EOF'
"""
All prompt strings used to call Gemini, kept as constants so they're easy to
tune without touching route/service logic. Mirrors plan section 10 exactly.
Each template is filled with .format(...) in app/services/ai_tasks.py.
"""

SIMPLIFY_PROMPT = """You are a reading accessibility specialist. Rewrite the text at the
requested level. Preserve every fact that changes meaning. Never add
information not present in the source.

LEVEL: {level}
- simplified: ~8th-grade level. Shorter sentences, common vocabulary,
  define technical terms inline on first use.
- very_simple: ~5th-grade level. Max ~12 words/sentence. One idea per
  sentence. Technical terms defined in parentheses.
- eli5: Explain like to a curious 8-year-old, using one concrete
  everyday analogy. Under 120 words.

Return JSON: {{"simplified_text": string}}

TEXT:
{input_text}"""

DYSLEXIA_REWRITE_PROMPT = """Rewrite for easier DECODING, not simpler meaning. Max 12 words/sentence.
No nested clauses — split into separate sentences. Prefer active voice.
One sentence per line. Do not lower the vocabulary level — only restructure.

Return JSON: {{"rewritten_text": string}}

TEXT:
{input_text}"""

KEY_POINTS_PROMPT = """Extract the 3-5 most important factual points from this text. Each point
must be a single short sentence, standalone and understandable without
reading the rest. Order by importance.

Return JSON: {{"key_points": string[]}}

TEXT:
{input_text}"""

SUMMARY_PROMPT = """Write a 2-3 sentence summary capturing the main idea and the single most
important supporting detail. Plain language, no jargon.

Return JSON: {{"summary": string}}

TEXT:
{input_text}"""

QUIZ_PROMPT = """Generate exactly 3 multiple-choice questions testing CONCEPTUAL
UNDERSTANDING (not vocabulary recall, not exact wording memorization).
4 choices each, exactly one correct. No "all of the above," no double
negatives. Base questions only on the text given.

Return JSON:
{{"questions": [{{"question": string, "choices": string[4], "answer_index": int}}]}}

TEXT:
{input_text}"""

WHY_CONFUSED_PROMPT = """The user selected a word or sentence while reading. Identify:
1. The single most difficult word or term in the selection (or null if
   none is genuinely difficult).
2. Its meaning in plain, everyday language.
3. A one-sentence simple explanation of the FULL selected text, using
   the surrounding context to resolve any hidden assumption or jargon.

Return JSON:
{{"difficult_word": string|null, "meaning": string, "simple_explanation": string}}

SELECTED TEXT:
{selected_text}

SURROUNDING CONTEXT:
{surrounding_context}"""

# Kept separate per plan section 10.7 for cases needing analogy-only output
# without a full rewrite. Not currently wired to a route, but available for
# future use from ai_tasks.py without inventing a new endpoint shape.
ELI5_ANALOGY_PROMPT = """Explain this concept using one clear everyday analogy a curious 8-year-old
would relate to (kitchen, playground, pets, sports — pick the best fit).
Map each part of the concept onto the analogy explicitly. Under 120 words.

Return JSON: {{"eli5_explanation": string}}

TEXT:
{input_text}"""
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/__init__.py" << 'LEXIFLOW_EOF'

LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/confused.py" << 'LEXIFLOW_EOF'
from fastapi import APIRouter

from app.schemas.confused import WhyConfusedRequest, WhyConfusedResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["why-confused"])


@router.post("/why-confused", response_model=WhyConfusedResponse)
def why_confused(payload: WhyConfusedRequest) -> WhyConfusedResponse:
    validate_text_length(payload.selected_text)
    if payload.surrounding_context:
        validate_text_length(payload.surrounding_context)
    result = ai_tasks.explain_confusion(payload.selected_text, payload.surrounding_context)
    return WhyConfusedResponse(**result)
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/dyslexia.py" << 'LEXIFLOW_EOF'
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
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/keypoints.py" << 'LEXIFLOW_EOF'
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
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/quiz.py" << 'LEXIFLOW_EOF'
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
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/readability.py" << 'LEXIFLOW_EOF'
from fastapi import APIRouter

from app.schemas.readability import ReadabilityRequest, ReadabilityResponse
from app.services.readability_service import score_readability
from app.utils.validation import validate_text_length

router = APIRouter(tags=["readability"])


@router.post("/readability", response_model=ReadabilityResponse)
def readability(payload: ReadabilityRequest) -> ReadabilityResponse:
    validate_text_length(payload.text)
    result = score_readability(payload.text)
    return ReadabilityResponse(**result)
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/simplify.py" << 'LEXIFLOW_EOF'
from fastapi import APIRouter

from app.schemas.simplify import SimplifyRequest, SimplifyResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["simplify"])


@router.post("/simplify", response_model=SimplifyResponse)
def simplify(payload: SimplifyRequest) -> SimplifyResponse:
    validate_text_length(payload.text)
    result = ai_tasks.simplify_text(payload.text, payload.level)
    return SimplifyResponse(**result)
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/summary.py" << 'LEXIFLOW_EOF'
from fastapi import APIRouter

from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services import ai_tasks
from app.utils.validation import validate_text_length

router = APIRouter(tags=["summary"])


@router.post("/summary", response_model=SummaryResponse)
def summary(payload: SummaryRequest) -> SummaryResponse:
    validate_text_length(payload.text)
    result = ai_tasks.generate_summary(payload.text)
    return SummaryResponse(**result)
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/routers/upload.py" << 'LEXIFLOW_EOF'
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.config import get_settings
from app.schemas.upload import ExtractPdfResponse
from app.services.pdf_extractor import extract_text_from_pdf

router = APIRouter(tags=["upload"])


@router.post("/extract-pdf", response_model=ExtractPdfResponse)
async def extract_pdf(file: UploadFile = File(...)) -> ExtractPdfResponse:
    settings = get_settings()

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a PDF file.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > settings.max_pdf_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"PDF exceeds the {settings.max_pdf_size_mb}MB limit.",
        )

    if not file_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    # PdfExtractionError is caught by the global handler in app/utils/error_handlers.py
    text, page_count = extract_text_from_pdf(file_bytes)
    return ExtractPdfResponse(text=text, page_count=page_count)
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/__init__.py" << 'LEXIFLOW_EOF'

LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/common.py" << 'LEXIFLOW_EOF'
"""Shared schemas used across multiple routers."""
from pydantic import BaseModel, Field


class TextRequest(BaseModel):
    """Base shape for the simple { "text": string } endpoints."""

    text: str = Field(..., min_length=1, description="Source text to process")


class ErrorResponse(BaseModel):
    detail: str
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/confused.py" << 'LEXIFLOW_EOF'
from typing import Optional

from pydantic import BaseModel, Field


class WhyConfusedRequest(BaseModel):
    selected_text: str = Field(..., min_length=1)
    surrounding_context: str = Field(default="", description="Surrounding text for context resolution")


class WhyConfusedResponse(BaseModel):
    difficult_word: Optional[str] = None
    meaning: str
    simple_explanation: str
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/dyslexia.py" << 'LEXIFLOW_EOF'
from pydantic import BaseModel, Field


class DyslexiaRewriteRequest(BaseModel):
    text: str = Field(..., min_length=1)


class DyslexiaRewriteResponse(BaseModel):
    rewritten_text: str
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/keypoints.py" << 'LEXIFLOW_EOF'
from typing import List

from pydantic import BaseModel, Field


class KeyPointsRequest(BaseModel):
    text: str = Field(..., min_length=1)


class KeyPointsResponse(BaseModel):
    key_points: List[str]
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/quiz.py" << 'LEXIFLOW_EOF'
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
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/readability.py" << 'LEXIFLOW_EOF'
from pydantic import BaseModel, Field


class ReadabilityRequest(BaseModel):
    text: str = Field(..., min_length=1)


class ReadabilityResponse(BaseModel):
    flesch_kincaid_grade: float
    dale_chall_score: float
    suggested_level: str
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/simplify.py" << 'LEXIFLOW_EOF'
from typing import Literal

from pydantic import BaseModel, Field

SimplifyLevel = Literal["simplified", "very_simple", "eli5"]


class SimplifyRequest(BaseModel):
    text: str = Field(..., min_length=1)
    level: SimplifyLevel = "simplified"


class SimplifyResponse(BaseModel):
    simplified_text: str
    reading_time_sec: int
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/summary.py" << 'LEXIFLOW_EOF'
from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):
    text: str = Field(..., min_length=1)


class SummaryResponse(BaseModel):
    summary: str
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/schemas/upload.py" << 'LEXIFLOW_EOF'
from pydantic import BaseModel


class ExtractPdfResponse(BaseModel):
    text: str
    page_count: int
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/services/__init__.py" << 'LEXIFLOW_EOF'

LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/services/ai_tasks.py" << 'LEXIFLOW_EOF'
"""
One function per AI task. Each builds the right prompt from
app/prompts/prompt_templates.py, calls Gemini, and returns a plain dict
ready to be validated against the matching response schema.

Keeping this as its own module (rather than putting prompt-building logic
inside the routers) is what makes every route file look identical: receive
request -> call a service function -> return response model.
"""
from typing import Any, Dict

from app.prompts import prompt_templates as prompts
from app.services.gemini_client import call_gemini


def simplify_text(text: str, level: str) -> Dict[str, Any]:
    prompt = prompts.SIMPLIFY_PROMPT.format(level=level, input_text=text)
    data = call_gemini(prompt)
    simplified_text = data.get("simplified_text", "")
    reading_time_sec = estimate_reading_time_sec(simplified_text)
    return {"simplified_text": simplified_text, "reading_time_sec": reading_time_sec}


def dyslexia_rewrite(text: str) -> Dict[str, Any]:
    prompt = prompts.DYSLEXIA_REWRITE_PROMPT.format(input_text=text)
    data = call_gemini(prompt)
    return {"rewritten_text": data.get("rewritten_text", "")}


def extract_key_points(text: str) -> Dict[str, Any]:
    prompt = prompts.KEY_POINTS_PROMPT.format(input_text=text)
    data = call_gemini(prompt)
    return {"key_points": data.get("key_points", [])}


def generate_summary(text: str) -> Dict[str, Any]:
    prompt = prompts.SUMMARY_PROMPT.format(input_text=text)
    data = call_gemini(prompt)
    return {"summary": data.get("summary", "")}


def generate_quiz(text: str) -> Dict[str, Any]:
    prompt = prompts.QUIZ_PROMPT.format(input_text=text)
    data = call_gemini(prompt)
    return {"questions": data.get("questions", [])}


def explain_confusion(selected_text: str, surrounding_context: str) -> Dict[str, Any]:
    prompt = prompts.WHY_CONFUSED_PROMPT.format(
        selected_text=selected_text,
        surrounding_context=surrounding_context or "(no additional context provided)",
    )
    data = call_gemini(prompt)
    return {
        "difficult_word": data.get("difficult_word"),
        "meaning": data.get("meaning", ""),
        "simple_explanation": data.get("simple_explanation", ""),
    }


def estimate_reading_time_sec(text: str, words_per_minute: int = 200) -> int:
    """Simple heuristic, no AI call needed — average adult silent reading speed."""
    word_count = len(text.split())
    minutes = word_count / words_per_minute
    return max(1, round(minutes * 60))
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/services/gemini_client.py" << 'LEXIFLOW_EOF'
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
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/services/pdf_extractor.py" << 'LEXIFLOW_EOF'
"""
PDF text extraction via PyMuPDF (fitz). Pure function: bytes in, text out.
No files are ever written to disk — everything happens in memory, consistent
with the "no cloud storage" constraint.
"""
import logging
from typing import Tuple

import fitz  # PyMuPDF

logger = logging.getLogger("lexiflow.pdf")


class PdfExtractionError(Exception):
    """Raised when a PDF can't be opened or parsed."""


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """
    Returns (full_text, page_count).

    Per the plan's risk analysis, this is a "Should Have" path — messy or
    scanned PDFs may yield little or no text. We don't attempt OCR (that's
    out of scope for a ₹0 5-day build); we surface what PyMuPDF can extract
    and let the frontend's paste-text path remain the reliable fallback.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:  # noqa: BLE001
        raise PdfExtractionError(f"Could not open this PDF: {exc}") from exc

    try:
        page_count = doc.page_count
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text("text"))
        full_text = "\n\n".join(part.strip() for part in text_parts if part.strip())
    finally:
        doc.close()

    if not full_text.strip():
        raise PdfExtractionError(
            "No extractable text found in this PDF. It may be a scanned image — "
            "try pasting the text directly instead."
        )

    return full_text, page_count
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/services/readability_service.py" << 'LEXIFLOW_EOF'
"""
Readability scoring via TextStat — instant, free, no AI call, exactly as
specified in plan section 3 ("Reading level detection... no AI call").
"""
import textstat


def _suggest_level(flesch_kincaid_grade: float) -> str:
    """Maps a Flesch-Kincaid grade level to a human-friendly label."""
    if flesch_kincaid_grade <= 5:
        return "very_simple"
    if flesch_kincaid_grade <= 8:
        return "simplified"
    if flesch_kincaid_grade <= 12:
        return "standard"
    return "advanced"


def score_readability(text: str) -> dict:
    flesch_kincaid_grade = textstat.flesch_kincaid_grade(text)
    dale_chall_score = textstat.dale_chall_readability_score(text)
    suggested_level = _suggest_level(flesch_kincaid_grade)

    return {
        "flesch_kincaid_grade": round(flesch_kincaid_grade, 2),
        "dale_chall_score": round(dale_chall_score, 2),
        "suggested_level": suggested_level,
    }
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/utils/__init__.py" << 'LEXIFLOW_EOF'

LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/utils/error_handlers.py" << 'LEXIFLOW_EOF'
"""
Global exception handlers. The goal, per the plan's risk analysis, is that
every failure mode returns clean JSON with a sensible status code —
never an unhandled 500 / blank response that breaks the frontend's UI.
"""
import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.services.gemini_client import GeminiError
from app.services.pdf_extractor import PdfExtractionError

logger = logging.getLogger("lexiflow.errors")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Invalid request data.", "errors": exc.errors()},
        )

    @app.exception_handler(GeminiError)
    async def gemini_error_handler(request: Request, exc: GeminiError):
        logger.error("Gemini failure on %s: %s", request.url.path, exc)
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={"detail": "The AI service couldn't process this request. Please try again."},
        )

    @app.exception_handler(PdfExtractionError)
    async def pdf_error_handler(request: Request, exc: PdfExtractionError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s", request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Something went wrong on our end. Please try again."},
        )
LEXIFLOW_EOF

cat > "${ROOT_DIR}/app/utils/validation.py" << 'LEXIFLOW_EOF'
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
LEXIFLOW_EOF

cat > "${ROOT_DIR}/requirements.txt" << 'LEXIFLOW_EOF'
fastapi==0.111.0
uvicorn[standard]==0.30.1
pydantic==2.7.4
pydantic-settings==2.3.4
python-multipart==0.0.9
google-generativeai==0.7.2
PyMuPDF==1.24.7
textstat==0.7.3
python-dotenv==1.0.1
LEXIFLOW_EOF


echo "Backend generated successfully at ./${ROOT_DIR}"
echo "Next steps:"
echo "  cd ${ROOT_DIR}"
echo "  python -m venv .venv && source .venv/bin/activate"
echo "  pip install -r requirements.txt"
echo "  cp .env.example .env   # then add your GEMINI_API_KEY"
echo "  uvicorn app.main:app --reload --port 8000"
