from database import get_db_connection
import schemas.contact_create as ContactCreate

def create_contact(contact: ContactCreate):
    cnxn = get_db_connection()
    cursor = cnxn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Contacts (Name, Address, Phone, Email, Type)
            OUTPUT INSERTED.Id
            VALUES (?, ?, ?, ?, ?)
        """, contact.Name, contact.Address, contact.Phone, contact.Email, contact.Type)

        contact_id = cursor.fetchone()[0]
        cnxn.commit()
        return contact_id

    except Exception as e:
        cnxn.rollback()
        raise e

    finally:
        cursor.close()
        cnxn.close()


def get_all_contacts():
    cnxn = get_db_connection()
    cursor = cnxn.cursor()
    try:
        cursor.execute("SELECT Id, Name, Address, Phone, Email, Type FROM Contacts")
        rows = cursor.fetchall()
        contacts = []
        for row in rows:
            contacts.append({
                "Id": row[0],
                "Name": row[1],
                "Address": row[2],
                "Phone": row[3],
                "Email": row[4],
                "Type": row[5]
            })
        return contacts
    except Exception as e:
        raise e
    finally:
        cursor.close()
        cnxn.close()