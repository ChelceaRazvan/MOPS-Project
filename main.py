from fastapi import FastAPI, HTTPException
import pyodbc
from backend.database import *
from backend.routes import invoice_routes


app = FastAPI()

# Înregistrează rutele în aplicație
app.include_router(invoice_routes.router, tags=["Invoices"])



