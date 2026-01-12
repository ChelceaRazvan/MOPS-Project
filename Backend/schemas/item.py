from pydantic import BaseModel
from typing import Optional


class Item(BaseModel):
    Id: int
    Supplier_Id: int
    Name: str
    Description: Optional[str]
    Qtty: float
    Sale_Price: float
    Buy_Price: float