from schemas.supplier_create import SupplierCreate
from repositories.supplier_repo import create_supplier, get_all_suppliers


from fastapi import APIRouter, HTTPException


router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.post("/add")
def add_supplier(supplier: SupplierCreate):
    try:
        ids = create_supplier(supplier)
        return ids
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all")
def see_all_suppliers():
    try:
        suppliers = get_all_suppliers()
        return suppliers
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))