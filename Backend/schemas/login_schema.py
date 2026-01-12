from pydantic import BaseModel, Field

class LoginSchema(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=100)
