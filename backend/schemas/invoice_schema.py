from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from decimal import Decimal

# Model pentru o linie de factură (Item)
class InvoiceLineCreate(BaseModel):
    item_id: int
    quantity: Decimal = Field(..., gt=0, description="Cantitatea")
    unit_price: Decimal = Field(..., ge=0, description="Pret unitar")
    vat_rate: Decimal = Field(..., ge=0, description="Cota TVA (ex: 19.00)")

# Model pentru Antetul Facturii + Lista de linii
class InvoiceCreateRequest(BaseModel):
    user_id: int
    invoice_number: str
    invoice_date: date
    invoice_type: int = Field(..., description="1 = Intrare, 2 = Iesire")
    
    # Optional fields (nullable in DB)
    supplier_id: Optional[int] = None
    client_id: Optional[int] = None
    
    currency_code: str = Field(..., min_length=3, max_length=3)
    exchange_rate: Decimal = Field(default=1.0)
    payment_terms: Optional[str] = None
    due_date: Optional[date] = None
    order_id: Optional[int] = None
    shipping_address: Optional[int] = None
    notes: Optional[str] = None

    # Lista de linii (Aici e magia, primim totul intr-un singur request)
    lines: List[InvoiceLineCreate]

class InvoiceCreateResponse(BaseModel):
    invoice_id: int
    message: str