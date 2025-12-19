from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from decimal import Decimal

# Model pentru Antetul Facturii + Lista de linii
class InvoiceCreateRequest(BaseModel):
    user_id: int
    invoice_number: str
    invoice_date: date    
    payment_terms: Optional[str] = None
    due_date: Optional[date] = None
    order_id: Optional[int] = None
    notes: Optional[str] = None

class InvoiceCreateResponse(BaseModel):
    invoice_id: int
    message: str

class InvoiceLineCreate(BaseModel):
    item_id: int
    qty: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    tax_rate: float = Field(default=19.0)
    
class OnlyInvoiceCreateRequest(BaseModel):
    user_id: int
    invoice_number: str
    invoice_date: date
    invoice_type: int = 1  # 1 pentru Achizitie
    supplier_id: Optional[int] = None
    client_id: Optional[int] = None
    currency_code: str = "RON"
    exchange_rate: float = 1.0
    payment_terms: Optional[str] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[InvoiceLineCreate]