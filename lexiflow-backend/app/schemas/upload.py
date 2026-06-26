from pydantic import BaseModel


class ExtractPdfResponse(BaseModel):
    text: str
    page_count: int
