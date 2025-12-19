import pyodbc

def get_db_connection():
    # Pe Mac Intel, localhost:1433 este mapat corect către container
    server = '127.0.0.1,1433' 
    database = 'ERP' 
    username = 'sa' 
    password = 'LicentaLixi1!' 
    
    # Folosim Driver 18 (instalat via Brew) și parametrii de securitate obligatorii
    connection_string = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        "Encrypt=yes;"
        "TrustServerCertificate=yes;"
        "Connection Timeout=30;"
    )
    try:
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        print(f"CRITICAL: Eroare conexiune: {e}")
        # Ridicăm eroarea mai departe pentru ca FastAPI să o prindă corect
        raise Exception(f"Nu s-a putut conecta la baza de date: {e}")