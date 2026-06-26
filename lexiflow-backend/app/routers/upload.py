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
