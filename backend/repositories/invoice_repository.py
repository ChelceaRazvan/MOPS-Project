import pyodbc
# Asigură-te că ai funcția get_db_connection definită undeva (ex: in database.py)
from database import get_db_connection 

def create_invoice_transaction() -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # --- PASUL 1: Creeaza Header-ul ---
        
        # Construim SQL-ul pentru a captura OUTPUT-ul (@New_Invoice_Id)
        # Folosim "SET NOCOUNT ON" pentru a nu interfera cu rezultatul SELECT-ului final
        sql_header = """
        DECLARE @new_id int;
        EXEC [dbo].[usp_Add_Invoice_Header] 
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
            @New_Invoice_Id = @new_id OUTPUT;
        SELECT @new_id AS new_id;
        """
        
        params_header = (
            data.user_id,
            data.invoice_number,
            data.invoice_date,
            data.invoice_type,
            data.supplier_id,
            data.client_id,
            data.currency_code,
            data.exchange_rate,
            data.payment_terms,
            data.due_date,
            data.order_id,
            data.shipping_address,
            data.notes
        )

        cursor.execute(sql_header, params_header)
        
        # Citim ID-ul returnat de SELECT @new_id
        row = cursor.fetchone()
        if not row or not row[0]:
            raise Exception("Eroare la crearea antetului facturii. ID-ul nu a fost returnat.")
        
        new_invoice_id = int(row[0])

        # --- PASUL 2: Adauga Liniile ---
        # Deoarece procedura ta de linie recalculeaza totalurile la fiecare insert,
        # putem sa le inseram pe rand.
        
        sql_line = """
        EXEC [dbo].[usp_Add_Invoice_Line] ?, ?, ?, ?, ?
        """

        for line in data.lines:
            params_line = (
                new_invoice_id,   # ID-ul generat mai sus
                line.item_id,
                line.quantity,
                line.unit_price,
                line.vat_rate
            )
            cursor.execute(sql_line, params_line)

        # Commit final (desi procedurile tale au commit intern, e bine de stiut)
        # Nota: Deoarece procedurile tale au BEGIN TRANSACTION / COMMIT inauntru,
        # ele vor scrie in baza de date imediat.
        # Daca a doua linie esueaza, prima linie si headerul raman salvate.
        conn.commit() 
        
        return new_invoice_id

    except Exception as e:
        # In caz de eroare in Python, incercam rollback, dar atentie:
        # Daca procedurile tale au facut deja COMMIT intern, acest rollback 
        # nu va anula ce s-a scris deja de proceduri.
        conn.rollback()
        raise e
    finally:
        conn.close()