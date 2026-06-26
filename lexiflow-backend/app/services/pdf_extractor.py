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
