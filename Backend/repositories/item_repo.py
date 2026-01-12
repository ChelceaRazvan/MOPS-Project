from database import get_db_connection
from schemas.item_create import ItemCreate
from datetime import datetime



def create_item(item: ItemCreate):
    cnxn = get_db_connection()
    cursor = cnxn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Items (Supplier_Id, Name, Description, Sale_Price, Buy_Price, Qtty)
            OUTPUT INSERTED.Id
            VALUES (?, ?, ?, ?, ?, ?)
        """, item.Supplier_Id, item.Name, item.Description, item.Sale_Price, item.Buy_Price, 0)

        item_id = cursor.fetchone()[0]
        cnxn.commit()

        return item_id

    except Exception as e:
        cnxn.rollback()
        raise e

    finally:
        cursor.close()
        cnxn.close()


def get_all_items():
    cnxn = get_db_connection()
    cursor = cnxn.cursor()
    try:
        cursor.execute("SELECT Id, Supplier_Id, Name, Description, Qtty, Sale_Price, Buy_Price FROM Items")
        rows = cursor.fetchall()
        items = []
        for row in rows:
            items.append({
                "Id": row[0],
                "Supplier_Id": row[1],
                "Name": row[2],
                "Description": row[3],
                "Qtty": float(row[4]),
                "Sale_Price": float(row[5]),
                "Buy_Price": float(row[6])
            })
        return items
    except Exception as e:
        raise e
    finally:
        cursor.close()
        cnxn.close()
