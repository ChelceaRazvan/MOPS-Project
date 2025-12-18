import pyodbc

def get_db_connection():
    server = 'localhost,1433'  # Update this with your server name
    database = 'Main'  # Update this with your database name
    username = 'sa'  # Update this with your username
    password = 'LicentaLixi!'  # Update this with your password
    cnxn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};'
                          f'SERVER={server};DATABASE={database};'
                          f'UID={username};PWD={password}')
    return cnxn