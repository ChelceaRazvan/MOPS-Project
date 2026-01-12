from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base

class Client(Base):
    __tablename__ = "Clients"

    Id = Column(Integer, primary_key=True, index=True)
    Name = Column(String(255), nullable=False)
    LegalName = Column(String(255), nullable=True)
    Fiscal_Code = Column(String(50), nullable=True)
    Country = Column(String(255), nullable=True)
    Currency = Column(String(50), nullable=True)
    Address = Column(String(255), nullable=True)
    Contact_Id = Column(Integer, ForeignKey("Contacts.Id"), nullable=False)
