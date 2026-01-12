
from database import SessionLocal
from sqlalchemy.orm import Session
from repositories.client_model import Client
from schemas.client_schema import ClientCreate, ClientRead
from services.client_service import add_client
from fastapi import APIRouter, Depends, status

router = APIRouter(prefix="/clients", tags=["clients"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    client = add_client(
        db,
        name=payload.name,
        legal_name=payload.legal_name,
        fiscal_code=payload.fiscal_code,
        country=payload.country,
        currency=payload.currency,
        address=payload.address,
        contact_id=payload.contact_id,
    )
    return client



