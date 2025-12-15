from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.register_schema import RegisterSchema
from database import SessionLocal
from services.register_services import register_user

from database import get_db

router = APIRouter(prefix="/auth", tags=["auth-register"])


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
