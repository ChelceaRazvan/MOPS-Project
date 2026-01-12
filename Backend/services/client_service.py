from sqlalchemy.orm import Session
from repositories.client_model import Client

def add_client(db: Session, *, name: str, legal_name: str | None,
               fiscal_code: str | None, country: str | None,
               currency: str | None, address: str | None,
               contact_id: int) -> Client:
    new_client = Client(
        Name=name,
        LegalName=legal_name,
        Fiscal_Code=fiscal_code,
        Country=country,
        Currency=currency,
        Address=address,
        Contact_Id=contact_id
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    return new_client
