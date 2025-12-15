from pydantic import BaseModel, Field
from typing import Optional


class ContactCreate(BaseModel):
    Name: str = Field(..., max_length=150)
    Address: Optional[str] = Field(None, max_length=255)
    Phone: Optional[str] = Field(None, max_length=50)
    Email: Optional[str]
    Type: int = Field(..., ge=0, le=255)
