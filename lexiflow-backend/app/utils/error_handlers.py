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
