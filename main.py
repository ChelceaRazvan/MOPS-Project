from fastapi import FastAPI, HTTPException
import pyodbc
from backend.database import get_db_connection
from backend.routes import invoice_routes, order_routes, nir_routes
from fastapi.middleware.cors import CORSMiddleware
# Importă routerele tale aici

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite orice conexiune pentru testare
    allow_credentials=True,
    allow_methods=["*"],  # Permite OPTIONS, POST, GET, etc.
    allow_headers=["*"],
)

# Înregistrează rutele în aplicație
app.include_router(invoice_routes.router)
app.include_router(order_routes.router, tags=["Orders"])
app.include_router(nir_routes.router)

@app.get("/get-list/{category}")
def get_list(category: str):
    # Mapăm ce cere Frontend-ul către tabelele din SQL
    table_map = {
        "suppliers": "Supplier",
        "items": "Item",
        "clients": "Client",
        "orders": "Order_Header", # Ajustează dacă tabelul tău se numește altfel
        "invoices": "Invoice_Header"
    }
    
    target_table = table_map.get(category)
    if not target_table: return []

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Preluăm Id și Name (Asigură-te că aceste coloane există!)
        cursor.execute(f"SELECT Id, Name FROM {target_table}")
        rows = cursor.fetchall()
        # Returnăm ID-ul ca string pentru a evita problemele de mapare în JS
        return [{"Id": str(r[0]), "Name": r[1]} for r in rows]
    except Exception as e:
        print(f"Eroare SQL pe {target_table}: {e}")
        return []
    finally:
        conn.close()