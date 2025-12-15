from database import get_db as get_db_connection
import schemas.supplier_create as SupplierCreate

from repositories.contact_repo import create_contact


def create_supplier(supplier: SupplierCreate):
    cnxn = get_db_connection()
    cursor = cnxn.cursor()
    try:
        contact_id = create_contact(supplier.contact)

        cursor.execute("""
                    INSERT INTO Suppliers 
                    (Name, LegalName, Fiscal_Code, Country, IBAN, Currency, Address, Contact_Id)
                    OUTPUT INSERTED.Id
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, supplier.Name, supplier.LegalName, supplier.Fiscal_Code, supplier.Country,
                       supplier.IBAN, supplier.Currency, supplier.Address, contact_id)

        supplier_id = cursor.fetchone()[0]
        cnxn.commit()

        return {
            "supplier_id": supplier_id,
            "contact_id": contact_id
        }

    except Exception as e:
        cnxn.rollback()
        raise e

    finally:
        cursor.close()
        cnxn.close()

def get_all_suppliers():
    cnxn = get_db_connection()
    cursor = cnxn.cursor()
    try:
        cursor.execute("""
            SELECT Id, Name, LegalName, Fiscal_Code, Country, IBAN, Currency, Address, Contact_Id 
            FROM Suppliers
        """)
        rows = cursor.fetchall()
        suppliers = []
        for row in rows:
            suppliers.append({
                "Id": row[0],
                "Name": row[1],
                "LegalName": row[2],
                "Fiscal_Code": row[3],
                "Country": row[4],
                "IBAN": row[5],
                "Currency": row[6],
                "Address": row[7],
                "Contact_Id": row[8]
            })
        return suppliers
    except Exception as e:
        raise e
    finally:
        cursor.close()
        cnxn.close()
