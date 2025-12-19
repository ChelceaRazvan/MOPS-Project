from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class OrderItem(BaseModel):
    item_id: int
    qtty: float = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    tax_rate: float = Field(default=19.0)
    line_number: int

class OrderCreateRequest(BaseModel):
    user_id: int
    document_type: str = Field(..., example="Purchase Order")
    order_number: str
    order_date: date  # Adăugat, lipsea din schema ta
    order_type: int = Field(1, description="1=Achizitie, 2=Vanzare")
    suplier_id: Optional[int] = None
    client_id: Optional[int] = None
    currency_code: str = Field(..., max_length=3, example="RON")
    exchange_rate: float
    shipping_address: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItem]