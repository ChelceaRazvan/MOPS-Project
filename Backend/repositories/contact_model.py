from sqlalchemy import Column, Integer, String
from database import Base

class Contact(Base):
    __tablename__ = "Contacts"

    Id = Column(Integer, primary_key=True, index=True)
    Name = Column(String(255), nullable=False)
    Address = Column(String(255), nullable=True)
    Phone = Column(String(50), nullable=True)
    Email = Column(String(255), nullable=True)
    Type = Column(String(50), nullable=True)
