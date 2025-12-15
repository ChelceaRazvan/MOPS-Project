from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.login_schema import LoginSchema
from database import SessionLocal
from services.login_services import login_user

router = APIRouter(prefix="/auth", tags=["auth-login"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(payload: LoginSchema, db: Session = Depends(get_db)):
    try:
        result = login_user(db, payload.username, payload.password)
        return result
    except ValueError as ve:
        msg = str(ve)
        if msg == "Cont inactiv.":
            raise HTTPException(status_code=403, detail=msg)
        raise HTTPException(status_code=401, detail=msg)
    except Exception:
        raise HTTPException(status_code=500, detail="Eroare la login.")
