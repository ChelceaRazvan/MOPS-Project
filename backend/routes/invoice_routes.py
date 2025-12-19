from fastapi import APIRouter, HTTPException, status
from backend.repositories import invoice_repository as repo
from backend.schemas import invoice_schema as sch

router = APIRouter()

@router.post("/invoices", status_code=status.HTTP_200_OK)
def create_invoice(invoice_data: sch.InvoiceCreateRequest):
    try:
        # Apeleaza repo-ul care face toata treaba (Header + Linii)
        new_id = repo.create_invoice_transaction(invoice_data)
        
        return {
            "invoice_id": new_id,
            "message": "Factura a fost creata cu succes, inclusiv liniile."
        }
    except Exception as e:
        # Log error here
        print(f"Eroare la crearea facturii: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=str(e)
        )
    
@router.post("/direct_invoices", status_code=200)
def create_only_invoice(data: sch.OnlyInvoiceCreateRequest):
    try:
        new_id = repo.create_invoice_direct(data)
        return {"invoice_id": new_id, "message": "Factura creata cu succes!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))