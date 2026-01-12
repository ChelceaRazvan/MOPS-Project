
from sqlalchemy.orm import Session
from repositories.contact_model import Contact

def add_contact(db: Session, *, name: str, address: str | None,
                phone: str | None, email: str | None, type: str | None):
    new_contact = Contact(
        Name=name,
        Address=address,
        Phone=phone,
        Email=email,
        Type=type
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact
