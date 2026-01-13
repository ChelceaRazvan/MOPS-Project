from fastapi import FastAPI, HTTPException
import pyodbc
from backend.database import get_db_connection
from backend.routes import invoice_routes, order_routes, nir_routes
from fastapi.middleware.cors import CORSMiddleware
# Importă routerele tale aici

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",        # 🔴 ADAUGĂ ASTA
        "http://127.0.0.1:5175",        # 🔴 ȘI ASTA
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Înregistrează rutele în aplicație
app.include_router(invoice_routes.router)
app.include_router(order_routes.router, tags=["Orders"])
app.include_router(nir_routes.router)
