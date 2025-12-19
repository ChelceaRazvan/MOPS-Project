from fastapi import FastAPI, HTTPException
import pyodbc
from backend.database import get_db_connection
from backend.routes import invoice_routes, order_routes


app = FastAPI()

# Înregistrează rutele în aplicație
app.include_router(invoice_routes.router)
app.include_router(order_routes.router, tags=["Orders"])



