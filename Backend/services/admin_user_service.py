from typing import Optional, Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import select
import os, bcrypt

from repositories.user_models import Users, Employees, UserRole

BCRYPT_ROUNDS = int(os.getenv("BCRYPT_ROUNDS", "12"))

def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(
        plain.encode("utf-8"),
        bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    ).decode("utf-8")

def _ensure_role(db: Session, role_id: Optional[int], role_name: Optional[str]) -> Optional[int]:
    """Returnează role_id. Creează rolul dacă primește roleName inexistent."""
    if role_name:
        existing = db.execute(select(UserRole).where(UserRole.Role_Name == role_name)).scalar_one_or_none()
        if existing:
            return existing.Id
        new_role = UserRole(Role_Name=role_name)
        db.add(new_role)
        db.flush()
        return new_role.Id
    if role_id is not None:
        role = db.get(UserRole, role_id)
        if not role:
            raise ValueError("Role_Id nu există.")
        return role_id
    return None

def admin_list_users(db: Session) -> List[Dict]:
    """Returnează utilizatorii cu info de bază + employee + role name."""
    rows = db.execute(
        select(Users, Employees, UserRole)
        .join(Employees, Users.Employee_Id == Employees.Id)
        .join(UserRole, Users.Role_Id == UserRole.Id)
    ).all()
    out = []
    for u, e, r in rows:
        out.append({
            "id": u.Id,
            "username": u.Username,
            "roleId": u.Role_Id,
            "roleName": r.Role_Name,
            "employee": {
                "id": e.Id,
                "firstName": e.First_Name,
                "lastName": e.Last_Name,
                "roleInCompany": e.Role,
                "phone": e.Phone,
                "salary": e.Salary,
                "email": e.Email,
            }
        })
    return out

def admin_get_user_detail(db: Session, user_id: int) -> Dict:
    u = db.get(Users, user_id)
    if not u:
        raise ValueError("User inexistent.")
    e = db.get(Employees, u.Employee_Id) if u.Employee_Id else None
    r = db.get(UserRole, u.Role_Id) if u.Role_Id else None
    return {
        "id": u.Id,
        "username": u.Username,
        "roleId": u.Role_Id,
        "roleName": r.Role_Name if r else None,
        "employee": {
            "id": e.Id if e else None,
            "firstName": e.First_Name if e else None,
            "lastName": e.Last_Name if e else None,
            "roleInCompany": e.Role if e else None,
            "phone": e.Phone if e else None,
            "salary": e.Salary if e else None,
            "email": e.Email if e else None,
        } if e else None
    }

def admin_update_user(
    db: Session,
    user_id: int,
    *,
    username: Optional[str] = None, # 0 / 1
    status: Optional[str] = None,
    role_id: Optional[int] = None,
    role_name: Optional[str] = None,
) -> Dict:
    user = db.get(Users, user_id)
    if not user:
        raise ValueError("User inexistent.")

    if username is not None:
        # Unicitate username
        existing = db.execute(
            select(Users).where(Users.Username == username, Users.Id != user_id)
        ).scalar_one_or_none()
        if existing:
            raise ValueError("Username deja folosit de un alt utilizator.")
        user.Username = username


    # rol (id sau name)
    new_role_id = _ensure_role(db, role_id, role_name)
    if new_role_id is not None:
        user.Role_Id = new_role_id

    db.commit()
    return {
        "id": user.Id,
        "username": user.Username,
        "roleId": user.Role_Id,
    }

def admin_update_employee(
    db: Session,
    employee_id: int,
    *,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    role_in_company: Optional[str] = None,
    phone: Optional[str] = None,
    salary: Optional[float] = None,
    email: Optional[str] = None,
) -> Dict:
    emp = db.get(Employees, employee_id)
    if not emp:
        raise ValueError("Employee inexistent.")

    if first_name is not None:
        emp.First_Name = first_name
    if last_name is not None:
        emp.Last_Name = last_name
    if role_in_company is not None:
        emp.Role = role_in_company
    if phone is not None:
        emp.Phone = phone
    if salary is not None:
        emp.Salary = salary
    if email is not None:
        emp.Email = email

    db.commit()
    return {
        "id": emp.Id,
        "firstName": emp.First_Name,
        "lastName": emp.Last_Name,
        "roleInCompany": emp.Role,
        "phone": emp.Phone,
        "salary": emp.Salary,
        "email": emp.Email,
    }

def admin_set_password(db: Session, user_id: int, new_password: str) -> Dict:
    if not new_password or len(new_password) < 8:
        raise ValueError("Parola trebuie să aibă cel puțin 8 caractere.")
    user = db.get(Users, user_id)
    if not user:
        raise ValueError("User inexistent.")
    user.Password = _hash_password(new_password)
    db.commit()
    return {"status": "ok"}

def admin_update_account_both(
    db: Session,
    user_id: int,
    *,
    user_update: Optional[dict] = None,
    employee_update: Optional[dict] = None,
) -> Dict:
    """
    Update atomic (într-o singură tranzacție) pentru Users + Employees.
    user_update chei posibile: username, status, roleId, roleName
    employee_update chei posibile: firstName, lastName, roleInCompany, phone, salary, email
    """
    user = db.get(Users, user_id)
    if not user:
        raise ValueError("User inexistent.")
    emp_id = user.Employee_Id
    emp = db.get(Employees, emp_id) if emp_id else None

    # Users
    if user_update:
        username = user_update.get("username")
        role_id = user_update.get("roleId")
        role_name = user_update.get("roleName")
        admin_update_user(db, user_id, username=username, role_id=role_id, role_name=role_name)

    # Employees
    if employee_update and emp:
        admin_update_employee(
            db, emp.Id,
            first_name=employee_update.get("firstName"),
            last_name=employee_update.get("lastName"),
            role_in_company=employee_update.get("roleInCompany"),
            phone=employee_update.get("phone"),
            salary=employee_update.get("salary"),
            email=employee_update.get("email"),
        )
