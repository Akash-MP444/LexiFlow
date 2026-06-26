from pydantic import BaseModel, Field


class DyslexiaRewriteRequest(BaseModel):
    text: str = Field(..., min_length=1)


class DyslexiaRewriteResponse(BaseModel):
    rewritten_text: str
