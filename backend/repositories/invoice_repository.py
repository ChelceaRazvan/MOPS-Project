import pyodbc
# Asigură-te că ai funcția get_db_connection definită undeva (ex: in database.py)
from backend.database import get_db_connection

def create_invoice_transaction(data) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # --- PASUL 1: Creeaza Header-ul ---
        
        # Construim SQL-ul pentru a captura OUTPUT-ul (@New_Invoice_Id)
        # Folosim "SET NOCOUNT ON" pentru a nu interfera cu rezultatul SELECT-ului final
        sql_header = """
        DECLARE @new_id INT;
        EXEC [dbo].[usp_Add_Invoice_Header] 
            @User_Id = ?, 
            @Invoice_Number = ?, 
            @Invoice_Date = ?, 
            @Payment_Terms = ?, 
            @Due_Date = ?, 
            @Order_Id = ?, 
            @Notes = ?
        """
 
        params_header = (
            data.user_id,
            data.invoice_number,
            data.invoice_date,
            data.payment_terms,
            data.due_date,
            data.order_id,
            data.notes
        )

        cursor.execute(sql_header, params_header)
        

        # Commit final (desi procedurile tale au commit intern, e bine de stiut)
        # Nota: Deoarece procedurile tale au BEGIN TRANSACTION / COMMIT inauntru,
        # ele vor scrie in baza de date imediat.
        # Daca a doua linie esueaza, prima linie si headerul raman salvate.
        conn.commit() 
        
    except Exception as e:
        # In caz de eroare in Python, incercam rollback, dar atentie:
        # Daca procedurile tale au facut deja COMMIT intern, acest rollback 
        # nu va anula ce s-a scris deja de proceduri.
        conn.rollback()
        raise e
    finally:
        conn.close()