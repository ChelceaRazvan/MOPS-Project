from fastapi import APIRouter, HTTPException, status
from backend.schemas import order_schema as sch
from backend.repositories import order_repository as repo

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)

@router.post("/", status_code=status.HTTP_200_OK)
def create_order(order_data: sch.OrderCreateRequest):
    """
    Creează o comandă nouă (Header + Linii) într-o singură tranzacție SQL.
    """
    try:
        new_order_id = repo.create_order(order_data)

        if not new_order_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Comanda nu a putut fi creată în baza de date."
            )

        return {
            "order_id": new_order_id,
            "message": "Comanda și liniile de comandă au fost salvate cu succes.",
            "status": "success"
        }

    except Exception as e:
        print(f"Eroare la crearea comenzii: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Eroare internă de server: {str(e)}"
        )