from typing import Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext
from datetime import datetime, timedelta
import bcrypt
import jwt
from datetime import datetime, timedelta
from settings import JWT_SECRET, JWT_ALG, JWT_EXPIRES_MIN, BCRYPT_ROUNDS
import os

from repositories.user_models import Users, Employees, UserRole

BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", "12"))
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret")          
JWT_EXPIRES_MIN = int(os.getenv("JWT_EXPIRES_MIN", "1440"))

pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto", bcrypt__rounds=BCRYPT_ROUNDS)

def get_user_by_username(db: Session, username: str) -> Optional[Users]:
    return db.execute(select(Users).where(Users.Username == username)).scalar_one_or_none()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))



def create_jwt_for_user(user: Users, role_name: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MIN)
    payload = {
        "sub": str(user.Id),   # sub ca string evita erori de tip in unele setup-uri
        "username": user.Username,
        "roleId": user.Role_Id,
        "employeeId": user.Employee_Id,
        "roleName": role_name,
        "exp": exp,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def login_user(db: Session, username: str, password: str) -> Dict:
    user = get_user_by_username(db, username)
    if not user:
        raise ValueError("Credențiale invalide.")
    if int(user.Status) != 1:
        raise ValueError("Cont inactiv.")
    if not verify_password(password, user.Password):
        raise ValueError("Credențiale invalide.")

    role_name = db.execute(select(UserRole.Role_Name).where(UserRole.Id == user.Role_Id)).scalar_one()
    emp = db.get(Employees, user.Employee_Id)

    token = create_jwt_for_user(user, role_name)
    return {
        "token": token,
        "user": {
            "id": user.Id,
            "username": user.Username,
            "firstName": emp.First_Name if emp else None,
            "lastName": emp.Last_Name if emp else None,
            "role": role_name
        }
    }
