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
