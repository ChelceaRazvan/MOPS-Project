from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, SmallInteger
from sqlalchemy.orm import relationship
from database import Base

class UserRole(Base):
    __tablename__ = "User_Role"
    Id = Column(Integer, primary_key=True, index=True)
    Role_Name = Column(String(100), nullable=False, unique=True)

    users = relationship("Users", back_populates="role")

class Employees(Base):
    __tablename__ = "Employees"
    Id = Column(Integer, primary_key=True, index=True)
    First_Name = Column(String(100), nullable=False)
    Last_Name = Column(String(100), nullable=False)
    Role = Column(String(100), nullable=True)
    Phone = Column(String(50), nullable=False)
    Salary = Column(Numeric(10, 2), nullable=True)
    Email = Column(String(150), nullable=False)

    users = relationship("Users", back_populates="employee")

class Users(Base):
    __tablename__ = "Users"
    Id = Column(Integer, primary_key=True, index=True)
    Role_Id = Column(Integer, ForeignKey("User_Role.Id"), nullable=False)
    Employee_Id = Column(Integer, ForeignKey("Employees.Id"), nullable=False)
    Username = Column(String(100), nullable=False, unique=True, index=True)
    Password = Column(String(200), nullable=False)
    Status = Column(SmallInteger, nullable=False)

    role = relationship("UserRole", back_populates="users")
    employee = relationship("Employees", back_populates="users")
