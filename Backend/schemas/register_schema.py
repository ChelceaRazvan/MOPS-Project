from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional

class RegisterSchema(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=100)
    status: int = Field(default=1, ge=0, le=1)

    firstName: str = Field(min_length=1, max_length=100)
    lastName: str = Field(min_length=1, max_length=100)
    roleInCompany: Optional[str] = Field(default=None, max_length=100)
    phone: Optional[str] = Field(default=None, max_length=50)
    salary: Optional[float] = None
    email: Optional[EmailStr] = None  # dacă vrei fără validator, schimbă în Optional[str]

    roleId: Optional[int] = Field(default=None, gt=0)
    roleName: Optional[str] = Field(default=None, min_length=2, max_length=100)

    @field_validator("roleId")
    @classmethod
    def validate_role_fields(cls, v, info):
        data = info.data
        if not v and not data.get("roleName"):
            raise ValueError("Trebuie să trimiți fie roleName, fie roleId.")
        return v
