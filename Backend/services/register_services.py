from typing import Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext
import os
import bcrypt

from repositories.user_models import Users, Employees, UserRole 

BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", "12"))
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto", bcrypt__rounds=BCRYPT_ROUNDS)

def _get_user_by_username(db: Session, username: str) -> Optional[Users]:
    return db.execute(select(Users).where(Users.Username == username)).scalar_one_or_none()

def _get_role_by_id(db: Session, role_id: int) -> Optional[UserRole]:
    return db.get(UserRole, role_id)

def _get_role_by_name(db: Session, role_name: str) -> Optional[UserRole]:
    return db.execute(select(UserRole).where(UserRole.Role_Name == role_name)).scalar_one_or_none()

def _ensure_role(db: Session, role_id: Optional[int], role_name: Optional[str]) -> int:
    
    if role_name:
        existing = _get_role_by_name(db, role_name)
        if existing:
            return existing.Id
        new_role = UserRole(Role_Name=role_name)
        db.add(new_role)
        db.flush()  # IDENTITY → Id populat
        return new_role.Id

    if role_id:
        role = _get_role_by_id(db, role_id)
        if role:
            return role.Id
        raise ValueError("Role_Id nu există și nu s-a furnizat roleName pentru a crea rolul.")


    raise ValueError("Trebuie să trimiți fie roleName, fie roleId.")

def hash_password(plain: str) -> str:

    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def register_user(db: Session, payload: Dict) -> Dict:
    """
    Creează Employees + (User_Role dacă e nevoie) + Users într-o singură tranzacție (routerul face with db.begin()).
    """
    if _get_user_by_username(db, payload["username"]):
        raise ValueError("Username deja folosit.")


    role_id = _ensure_role(db, payload.get("roleId"), payload.get("roleName"))


    emp = Employees(
        First_Name=payload["firstName"],
        Last_Name=payload["lastName"],
        Role=payload.get("roleInCompany"),
        Phone=payload.get("phone"),
        Salary=payload.get("salary"),
        Email=payload.get("email"),
    )
    db.add(emp)
    db.flush() 

    password_hash = hash_password(payload["password"])

    user = Users(
        Role_Id=role_id,
        Employee_Id=emp.Id,
        Username=payload["username"],
        Password=password_hash,
        Status=payload.get("status", 1),
    )
    db.add(user)
    db.flush()

    return {"userId": user.Id, "employeeId": emp.Id, "roleId": role_id}
