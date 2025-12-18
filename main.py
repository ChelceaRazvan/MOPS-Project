from fastapi import FastAPI, HTTPException
import pyodbc
from backend.database import *
from backend.routes import invoice_routes


app = FastAPI()

# Înregistrează rutele în aplicație
app.include_router(invoice_routes.router, tags=["Invoices"])

@app.get("/test-db")
def test_database_connection():
    try:
        cnxn = get_db_connection()
        cursor = cnxn.cursor()
        cursor.execute("SELECT @@VERSION;")
        result = cursor.fetchone()
        if result:
            # Asigură-te că rezultatul este convertit într-un tip de date serializabil, de exemplu, string
            version = result[0] if result else "Unknown"
        else:
            version = "No result"
        cursor.close() 
        cnxn.close()
        return {"db_version lixi este": version}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

