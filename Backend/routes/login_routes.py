from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.login_schema import LoginSchema
from database import SessionLocal
from services.login_services import login_user
from database import get_db

import traceback

router = APIRouter(prefix="/auth", tags=["auth-login"])

@router.post("/login")
def login(payload: LoginSchema, db: Session = Depends(get_db)):
    try:
        # încearcă să autentifici utilizatorul
        result = login_user(db, payload.username, payload.password)
        return result

    except ValueError as ve:
        # Erori așteptate, de exemplu cont inactiv sau date incorecte
        msg = str(ve)
        if msg == "Cont inactiv.":
            raise HTTPException(status_code=403, detail={"error": msg})
        else:
            raise HTTPException(status_code=401, detail={"error": msg})

    except Exception as ex:
        # Erori neașteptate → logăm traceback pentru debugging
        tb = traceback.format_exc()
        # Afișăm un mesaj mai descriptiv pentru dezvoltare
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "exception_type": type(ex).__name__,
                "message": str(ex),
                "traceback": tb  # în producție, poți să elimini traceback-ul
            }
        )