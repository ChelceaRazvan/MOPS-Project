
from repositories.contact_model import Contact
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import SessionLocal
from services.auth_admin_services import require_admin
from services.contact_service import add_contact

router = APIRouter(prefix="/contacts", tags=["contacts"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AddContactPayload(BaseModel):
    name: str
    address: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    type: str | None = None

class ContactOut(BaseModel):
    Id: int
    Name: str
    Address: str | None = None
    Phone: str | None = None
    Email: str | None = None
    Type: str | int | None = None

    class Config:
        from_attributes = True

@router.get("/", response_model=list[ContactOut])
def list_contacts(
    db: Session = Depends(get_db),
):
    rows = db.query(Contact).all()
    return rows


@router.post("/")
def create_contact(payload: AddContactPayload,
                   db: Session = Depends(get_db),
                   _ = Depends(require_admin)):
    try:
        return add_contact(
            db,
            name=payload.name,
            address=payload.address,
            phone=payload.phone,
            email=payload.email,
            type=payload.type,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
from schemas.contact_create import ContactCreate
from repositories.contact_repo import create_contact, get_all_contacts


from fastapi import APIRouter, HTTPException



router = APIRouter(prefix="/contacts", tags=["Contacts"])


@router.post("/add")
def add_contact(contact: ContactCreate):
    try:
        contact_id = create_contact(contact)
        return {"contact_id": contact_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/all")
def see_all_contacts():
    try:
        contacts = get_all_contacts()
        return contacts
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
