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
