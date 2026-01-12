
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session
from database import SessionLocal

from services.auth_admin_services import require_admin
from services.admin_user_service import (
    admin_list_users,
    admin_get_user_detail,
    admin_update_user,
    admin_update_employee,
    admin_set_password,
    admin_update_account_both,
)

router = APIRouter(prefix="/admin", tags=["admin"])

# -------- LIST & DETAIL --------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/users")
def list_users(db: Session = Depends(get_db), _ = Depends(require_admin)):
    return admin_list_users(db)

@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), _ = Depends(require_admin)):
    try:
        return admin_get_user_detail(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

# -------- UPDATE USERS --------

class UpdateUserPayload(BaseModel):
    username: str | None = None
    status: int | None = Field(default=None, description="0 / 1")
    roleId: int | None = None
    roleName: str | None = None

@router.patch("/users/{user_id}")
def patch_user(user_id: int, payload: UpdateUserPayload, db: Session = Depends(get_db), _ = Depends(require_admin)):
    try:
        return admin_update_user(
            db,
            user_id,
            username=payload.username,
            status=payload.status,
            role_id=payload.roleId,
            role_name=payload.roleName,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# -------- UPDATE EMPLOYEES --------

class UpdateEmployeePayload(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    roleInCompany: str | None = None
    phone: str | None = None
    salary: float | None = None
    email: EmailStr | str | None = None  # dacă email e opțional, acceptă și string simplu

@router.patch("/employees/{employee_id}")
def patch_employee(employee_id: int, payload: UpdateEmployeePayload, db: Session = Depends(get_db), _ = Depends(require_admin)):
    try:
        return admin_update_employee(
            db,
            employee_id,
            first_name=payload.firstName,
            last_name=payload.lastName,
            role_in_company=payload.roleInCompany,
            phone=payload.phone,
            salary=payload.salary,
            email=payload.email,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# -------- RESET PAROLĂ --------

class SetPasswordPayload(BaseModel):
    newPassword: str = Field(min_length=8)

@router.put("/users/{user_id}/password")
def set_password(user_id: int, payload: SetPasswordPayload, db: Session = Depends(get_db), _ = Depends(require_admin)):
    try:
        return admin_set_password(db, user_id, payload.newPassword)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# -------- UPDATE COMBINAT (Users + Employees, atomic) --------

class CombinedUserPayload(BaseModel):
    username: str | None = None
    status: int | None = None
    roleId: int | None = None
    roleName: str | None = None

class CombinedEmployeePayload(BaseModel):
    firstName: str | None = None
    lastName: str | None = None
    roleInCompany: str | None = None
    phone: str | None = None
    salary: float | None = None
    email: str | None = None

class UpdateAccountPayload(BaseModel):
    user: CombinedUserPayload | None = None
    employee: CombinedEmployeePayload | None = None


@router.put("/users/{user_id}/account")
def update_account(
    user_id: int,
    payload: UpdateAccountPayload,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    try:
        # Dacă vrei tranzacție explicită pentru atomicitate:
        # with db.begin():
        return admin_update_account_both(
            db,
            user_id,
            user_update=(payload.user.dict(exclude_none=True) if payload.user else None),
            employee_update=(payload.employee.dict(exclude_none=True) if payload.employee else None),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
