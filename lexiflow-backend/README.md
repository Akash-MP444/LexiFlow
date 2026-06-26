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
