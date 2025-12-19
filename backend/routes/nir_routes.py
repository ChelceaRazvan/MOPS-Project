from fastapi import APIRouter, HTTPException
from backend.schemas.nir_schema import NIRCreateRequest
from backend.repositories import nir_repository as repo

router = APIRouter(prefix="/nirs", tags=["NIR"])

@router.post("/from-invoice", status_code=200)
def generate_nir(data: NIRCreateRequest):
    try:
        nir_id = repo.create_nir_from_invoice(data)
        return {"nir_id": nir_id, "message": "NIR generat și stoc actualizat!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))