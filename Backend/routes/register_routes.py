from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.register_schema import RegisterSchema
from database import SessionLocal
from services.register_services import register_user

router = APIRouter(prefix="/auth", tags=["auth-register"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(payload: RegisterSchema, db: Session = Depends(get_db)):
    try:
        with db.begin():
            result = register_user(db, payload.model_dump())
        return {"message": "Înregistrare reușită.", "data": result}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Eroare la înregistrare.")
