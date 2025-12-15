from pydantic import BaseModel, Field
from typing import Optional


class ItemCreate(BaseModel):
    Supplier_Id: int = Field(..., gt=0)
    Name: str = Field(..., max_length=200)
    Description: Optional[str] = None
    Sale_Price: float = Field(..., ge=0)
    Buy_Price: float = Field(..., ge=0)
