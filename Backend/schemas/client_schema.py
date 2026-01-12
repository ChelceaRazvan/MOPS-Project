
from typing import Optional
from pydantic import BaseModel, Field

class ClientCreate(BaseModel):
    # alias = numele cheii așteptate în JSON (camelCase)
    name: str = Field(..., alias="name")
    legal_name: Optional[str] = Field(None, alias="legalName")
    fiscal_code: Optional[str] = Field(None, alias="fiscalCode")
    country: Optional[str] = Field(None, alias="country")
    currency: Optional[str] = Field(None, alias="currency")
    address: Optional[str] = Field(None, alias="address")
    contact_id: int = Field(..., alias="contactId")

    # permite și popularea prin numele intern (snake_case), dacă vei trimite cândva snake_case
    model_config = {
        "populate_by_name": True
    }


class ClientRead(BaseModel):
    Id: int
    Name: str
    LegalName: Optional[str] = None
    Fiscal_Code: Optional[str] = None
    Country: Optional[str] = None
    Currency: Optional[str] = None
    Address: Optional[str] = None
    Contact_Id: Optional[int] = None

    class Config:
        from_attributes = True
