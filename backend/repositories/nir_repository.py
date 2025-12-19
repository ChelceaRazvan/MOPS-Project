from backend.database import get_db_connection

def create_nir_from_invoice(data) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Pas 1: Header
        sql_h = "DECLARE @nid INT; EXEC [dbo].[usp_Create_NIR_From_Invoice] ?, ?, ?, ?, @nid OUTPUT; SELECT @nid;"
        cursor.execute(sql_h, (data.user_id, data.invoice_id, data.nir_number, data.nir_date))
        nir_id = cursor.fetchone()[0]

        # Pas 2: Linii + Stock
        sql_l = "EXEC [dbo].[usp_Add_NIR_Line_From_Invoice] ?, ?, ?"
        for item in data.items:
            cursor.execute(sql_l, (nir_id, item.invoice_detail_id, item.quantity_received))

        conn.commit()
        return nir_id
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()