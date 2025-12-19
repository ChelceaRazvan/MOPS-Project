from pydantic import BaseModel
from typing import List
from datetime import date

class NIRLineRequest(BaseModel):
    invoice_detail_id: int
    quantity_received: float

class NIRCreateRequest(BaseModel):
    user_id: int
    invoice_id: int
    nir_number: str
    nir_date: date
    items: List[NIRLineRequest]