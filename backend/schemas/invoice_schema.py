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