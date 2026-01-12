
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
from settings import JWT_SECRET, JWT_ALG


security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return {
            "user_id": payload.get("sub"),
            "username": payload.get("username"),
            "roleName": payload.get("roleName"),
            "roleId": payload.get("roleId"),
            "employeeId": payload.get("employeeId"),
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirat")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid")

def require_admin(current = Depends(get_current_user)):
    role = (current.get("roleName") or "").strip().lower()
    if role not in {"admin", "administrator"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acces interzis (admin only)")

