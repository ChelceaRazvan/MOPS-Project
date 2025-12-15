from schemas.contact_create import ContactCreate

from pydantic import BaseModel, Field
from typing import Optional


class SupplierCreate(BaseModel):
    Name: str = Field(..., max_length=150)
    LegalName: Optional[str] = Field(None, max_length=200)
    Fiscal_Code: Optional[str] = Field(None, max_length=50)
    Country: Optional[str] = Field(None, max_length=100)
    IBAN: Optional[str] = Field(None, max_length=50)
    Currency: Optional[str] = Field(None, max_length=10)
    Address: Optional[str] = Field(None, max_length=255)
    contact: ContactCreate