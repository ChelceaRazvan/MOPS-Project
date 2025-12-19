import pyodbc
from backend.database import get_db_connection

def create_order(data) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        order_sql = """
        DECLARE @new_order_id INT;
        EXEC [dbo].[usp_Add_Order_Header]
            @User_Id = ?,
            @Document_Type = ?,
            @Order_Number = ?,
            @Order_Date = ?,
            @Order_Type = ?,
            @Supplier_Id = ?,
            @Client_Id = ?,
            @Currency_Code = ?,
            @Exchange_Rate = ?,
            @Shipping_Address = ?,
            @Notes = ?,
            @New_Order_Id = @new_order_id OUTPUT;
        SELECT @new_order_id;
        """

        order_params = (
            data.user_id, data.document_type, data.order_number,
            data.order_date, data.order_type, data.suplier_id,
            data.client_id, data.currency_code, data.exchange_rate,
            data.shipping_address, data.notes
        )
        
        cursor.execute(order_sql, order_params)
        new_order_id = cursor.fetchone()[0]

        if not new_order_id:
            raise Exception("Nu s-a putut genera ID-ul comenzii.")
        
        order_detail_sql = """
        EXEC [dbo].[usp_Add_Order_Line]
            @Order_Id = ?,
            @Item_Id = ?,
            @Qtty = ?,
            @Unit_Price = ?,
            @VAT_Rate = ?
        """

        for item in data.items:
            cursor.execute(order_detail_sql, (
                new_order_id, 
                item.item_id, 
                item.qtty, 
                item.unit_price, 
                item.tax_rate
            ))

        conn.commit()
        return new_order_id

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()