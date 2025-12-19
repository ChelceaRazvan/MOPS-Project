
use ERP;
GO

----------------------------------------------------
-- 1. CONTACTS
----------------------------------------------------
CREATE TABLE Contacts (
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    Address NVARCHAR(255),
    Phone NVARCHAR(50),
    Email NVARCHAR(150),
    Type TINYINT NOT NULL,   -- 1 supplier, 2 client
    
    CONSTRAINT PK_Contacts PRIMARY KEY CLUSTERED (Id)
);
GO


----------------------------------------------------
-- 2. SUPPLIERS
----------------------------------------------------
CREATE TABLE Suppliers (
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    LegalName NVARCHAR(200),
    Fiscal_Code NVARCHAR(50),
    Country NVARCHAR(100),
    IBAN NVARCHAR(50),
    Currency NVARCHAR(10),
    Address NVARCHAR(255),
    Contact_Id INT,

    CONSTRAINT PK_Suppliers PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Suppliers_Contacts 
        FOREIGN KEY (Contact_Id) REFERENCES Contacts(Id)
);
GO


----------------------------------------------------
-- 3. CLIENTS
----------------------------------------------------
CREATE TABLE Clients (
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    LegalName NVARCHAR(200),
    Fiscal_Code NVARCHAR(50),
    Country NVARCHAR(100),
    Currency NVARCHAR(10),
    Address NVARCHAR(255),
    Contact_Id INT,
    
    CONSTRAINT PK_Clients PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Clients_Contacts 
        FOREIGN KEY (Contact_Id) REFERENCES Contacts(Id)
);
GO


----------------------------------------------------
-- 4. EMPLOYEES
----------------------------------------------------
CREATE TABLE Employees (
    Id INT IDENTITY(1,1) NOT NULL,
    First_Name NVARCHAR(100) NOT NULL,
    Last_Name NVARCHAR(100) NOT NULL,
    Role NVARCHAR(100),
    Phone NVARCHAR(50),
    Salary DECIMAL(10,2),
    Email NVARCHAR(150),

    CONSTRAINT PK_Employees PRIMARY KEY CLUSTERED (Id)
);
GO


----------------------------------------------------
-- 5. USER_ROLE
----------------------------------------------------
CREATE TABLE User_Role (
    Id INT IDENTITY(1,1) NOT NULL,
    Role_Name NVARCHAR(100) NOT NULL,

    CONSTRAINT PK_User_Role PRIMARY KEY CLUSTERED (Id)
);
GO


----------------------------------------------------
-- 6. USERS
----------------------------------------------------
CREATE TABLE Users (
    Id INT IDENTITY(1,1) NOT NULL,
    Role_Id INT NOT NULL,
    Employee_Id INT NOT NULL,
    Username NVARCHAR(100) NOT NULL,
    Password NVARCHAR(200) NOT NULL,
    Status TINYINT NOT NULL, -- 0 inactive, 1 active

    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_Users_UserRole
        FOREIGN KEY (Role_Id) REFERENCES User_Role(Id),

    CONSTRAINT FK_Users_Employees
        FOREIGN KEY (Employee_Id) REFERENCES Employees(Id)
);
GO


----------------------------------------------------
-- 7. USER_ROLE_PERMISSION
----------------------------------------------------
CREATE TABLE User_Role_Permission (
    Role_Id INT NOT NULL,   -- PK + FK to user_role.id
    Vanzari BIT NOT NULL DEFAULT 0,
    Achizitii BIT NOT NULL DEFAULT 0,
    Inventar BIT NOT NULL DEFAULT 0,
    Administrare BIT NOT NULL DEFAULT 0,
    Documente BIT NOT NULL DEFAULT 0,
    Rapoarte BIT NOT NULL DEFAULT 0,

    CONSTRAINT PK_UserRolePermission PRIMARY KEY CLUSTERED (Role_Id),

    CONSTRAINT FK_UserRolePermission_UserRole
        FOREIGN KEY (Role_Id) REFERENCES User_Role(Id)
);
GO


----------------------------------------------------
-- ITEMS
----------------------------------------------------
CREATE TABLE Items (
    Id INT IDENTITY(1,1) NOT NULL,
    Supplier_Id INT NOT NULL,                -- FK către Suppliers.Id
    Qtty DECIMAL(18,2) NOT NULL DEFAULT 0,   -- cantitate în stoc
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX),
    Sale_Price DECIMAL(18,2) NOT NULL,       -- preț de vânzare
    Buy_Price DECIMAL(18,2) NOT NULL,        -- preț de achiziție

    CONSTRAINT PK_Items PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_Items_Suppliers
        FOREIGN KEY (Supplier_Id) REFERENCES Suppliers(Id)
);
GO


CREATE TABLE Document (
    Id INT IDENTITY(1,1) NOT NULL,
    User_Id INT NOT NULL,                  -- FK -> Users.Id
    Document_State NVARCHAR(20) NOT NULL DEFAULT 'Draft',                -- exemplu: 0 draft, 1 finalized
    Document_Date DATE NOT NULL,
    Document_Type NVARCHAR(50) NOT NULL,   -- ex: factura, aviz, etc.

    CONSTRAINT PK_Document PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Document_Users 
        FOREIGN KEY (User_Id) REFERENCES Users(Id)
);
GO



CREATE TABLE [Order] (
    Id INT IDENTITY(1,1),            -- identificator unic
    Document_Id INT,                        -- optional
    Order_Number VARCHAR(50) NOT NULL,                 -- număr PO
    Order_Date DATE NOT NULL,
    Order_Type INT NOT NULL DEFAULT 1,                       -- 1 e cf 2 e cc
    Supplier_Id INT,                       -- ID furnizor
    Client_Id INT,                          -- ID client (daca e cazul)
    Currency_Code CHAR(3) NOT NULL,                 -- RON/EUR/USD
    Exchange_Rate DECIMAL(18,6),                    -- rata de schimb
    Shipping_Address NVARCHAR(MAX),                         -- adresă livrare
    Notes NVARCHAR(MAX),                            -- observații
    Amount DECIMAL(18,2) DEFAULT 0,
    Tax_Amount DECIMAL(18,2) DEFAULT 0,
    Total_Amount AS (Amount + Tax_Amount)   -- calculat automat

    CONSTRAINT PK_Order PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_Order_Document
        FOREIGN KEY (Document_Id) REFERENCES Document(Id),

    CONSTRAINT FK_Order_Suplier
        FOREIGN KEY (Supplier_Id) REFERENCES Suppliers(Id),

    CONSTRAINT FK_Order_Client
        FOREIGN KEY (Client_Id) REFERENCES Clients(Id),
    
    CONSTRAINT Order_Type
       CHECK (
        (Order_Type = 1 AND Client_Id IS NULL AND Supplier_Id IS NOT NULL)
        OR (Order_Type = 2 AND Supplier_Id IS NULL AND Client_Id IS NOT NULL))

);
GO


CREATE TABLE Invoice (
    Id INT IDENTITY(1,1) NOT NULL,
    Document_Id INT,
    Invoice_Number NVARCHAR(100) NOT NULL,
    Invoice_Date DATE NOT NULL,
    Invoice_Type INT NOT NULL DEFAULT 1,                       -- 1 e cf 2 e cc
    Supplier_Id INT,                       -- ID furnizor
    Client_Id INT,                          -- ID client (daca e cazul)                              -- FK
    Shipping_Address NVARCHAR(MAX),                                   -- FK
    Currency_Code CHAR(3) NOT NULL,
    Exchange_Rate DECIMAL(18,6),
    Payment_Terms NVARCHAR(50),
    Due_Date DATE,
    Order_Id INT,
    Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Tax_Total DECIMAL(18,2) NOT NULL DEFAULT 0,
    Total_Amount AS (Amount + Tax_Total),
    Notes NVARCHAR(MAX),

    CONSTRAINT PK_Invoice PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_Invoice_Document
        FOREIGN KEY (Document_Id) REFERENCES Document(Id),

    CONSTRAINT FK_Invoice_Supplier
        FOREIGN KEY (Supplier_Id) REFERENCES Suppliers(Id),

    CONSTRAINT FK_Invoice_Buyer
        FOREIGN KEY (Client_Id) REFERENCES Clients(Id),

    CONSTRAINT Invoice_Type
       CHECK (
        (Invoice_Type = 1 AND Client_Id IS NULL AND Supplier_Id IS NOT NULL)
        OR (Invoice_Type = 2 AND Supplier_Id IS NULL AND Client_Id IS NOT NULL))
);
GO



CREATE TABLE NIR (
    Id INT IDENTITY(1,1) NOT NULL,
    Document_Id INT,
    Nir_Number NVARCHAR(100) NOT NULL,
    Nir_Date DATE NOT NULL,
    IsVRN INT NOT NULL DEFAULT 0, -- 1= VRN 0 = NIR
    Supplier_Id INT NOT NULL,         
    Currency_Code CHAR(3) NOT NULL,
    Exchange_Rate DECIMAL(18,6),
    Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Tax_Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Total_Amount AS (Amount + Tax_Amount),
    Notes NVARCHAR(MAX),                               -- FK Contacts

    CONSTRAINT PK_NIR PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_NIR_Supplier
        FOREIGN KEY (Supplier_Id) REFERENCES Suppliers(Id),

    CONSTRAINT FK_NIR_Document
        FOREIGN KEY (Document_Id) REFERENCES Document(Id)        -- presupunere: PO = Document

);
GO


CREATE TABLE CreditNote (
    Id INT IDENTITY(1,1) NOT NULL,
    CN_Number NVARCHAR(100) NOT NULL,
    CN_Date DATE NOT NULL,
    Supplier_Id NVARCHAR(255) NOT NULL,
    Currency_Code CHAR(3) NOT NULL,
    Exchange_Rate DECIMAL(18,6),
    Invoice_Id INT,                            -- FK optional
    Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Tax_Amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    Total_Amount AS (Amount + Tax_Amount),
    Notes NVARCHAR(MAX),

    CONSTRAINT PK_CreditNote PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_CreditNote_PurchaseInvoice
        FOREIGN KEY (Invoice_Id) REFERENCES Invoice(Id),
);
GO


----------------------------------------------------
-- 2. DOCUMENT_DETAIL
----------------------------------------------------
CREATE TABLE Document_Detail (
    Id INT IDENTITY(1,1) NOT NULL,
    Document_Id INT NOT NULL,              -- FK -> Document.Id
    Item_Id INT NOT NULL,                  -- FK -> Items.Id (îți pot crea tabelul)
    Qtty DECIMAL(18,2) NOT NULL,
    Unit_Price DECIMAL(18,2) NOT NULL,
    Tax_Rate DECIMAL(5,2) NOT NULL,        -- procent TVA: ex 19.00

    CONSTRAINT PK_DocumentDetail PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_DocumentDetail_Document
        FOREIGN KEY (Document_Id) REFERENCES Document(Id),

    CONSTRAINT FK_DocumentDetail_Items
        FOREIGN KEY (Item_Id) REFERENCES Items(Id)
);
GO



CREATE TABLE InvoiceDetail (
    Invoice_Detail_Id INT NOT NULL,      -- identificator unic pentru linia de factură
    Invoice_Id INT NOT NULL,                      -- referință către factura principală
    Line_Number INT NOT NULL,                     -- număr linie
    Item_Id INT NOT NULL,              -- cod produs / item_code
    Qtty DECIMAL(18,2) NOT NULL,              -- cantitate
    Unit_Price DECIMAL(18,2) NOT NULL,            -- preț unitar
    VAT_Rate DECIMAL(5,2) NOT NULL,               -- rata TVA (ex: 19.00)
    Line_Subtotal AS (Qtty * Unit_Price),     -- subtotal înainte de taxe (calculat automat)
    Line_Tax_Amount AS ( (Qtty * Unit_Price) * (VAT_Rate / 100) ), -- calcul TVA
    Line_Total AS ( (Qtty * Unit_Price) + ((Qtty * Unit_Price) * (VAT_Rate / 100)) ), -- total linie


    CONSTRAINT PK_InvoiceDetail PRIMARY KEY CLUSTERED (Invoice_Detail_Id),

    CONSTRAINT FK_InvoiceDetail_DocumentDetail FOREIGN KEY (Invoice_Detail_Id)
        REFERENCES Document_Detail(Id),

    CONSTRAINT FK_InvoiceDetail_Invoice FOREIGN KEY (Invoice_Id)
        REFERENCES Invoice(Id),

    CONSTRAINT FK_InvoiceDetail_Item
        FOREIGN KEY (Item_Id) REFERENCES Items(Id)
    
);
GO



CREATE TABLE OrderDetail (
    Order_Detail_Id INT NOT NULL,                -- identificator unic linie comandă
    Order_Id INT NOT NULL,                       -- FK către Order
    Line_Number INT NOT NULL,                    -- număr linie
    Item_Id INT NOT NULL,                        -- cod produs
    Qtty DECIMAL(18,2) NOT NULL,     -- cantitatea comandată
    Unit_Price DECIMAL(18,2) NOT NULL,           -- preț unitar
    VAT_Rate DECIMAL(5,2) NOT NULL,              -- cotă TVA
    Line_Subtotal AS (Qtty * Unit_Price), 
    Line_Tax_Amount AS ((Qtty * Unit_Price) * (VAT_Rate / 100)),
    Line_Total AS ((Qtty * Unit_Price) + 
                  ((Qtty * Unit_Price) * (VAT_Rate / 100))),

    CONSTRAINT PK_OrderDetail PRIMARY KEY CLUSTERED (Order_Detail_Id),

    CONSTRAINT FK_OrderDetail_DocumentDetail FOREIGN KEY (Order_Detail_Id)
        REFERENCES Document_Detail(Id),    

    CONSTRAINT FK_OrderDetail_Order FOREIGN KEY (Order_Id) 
        REFERENCES [Order](Id),

    CONSTRAINT FK_OrderDetail_Item FOREIGN KEY (Item_Id)
        REFERENCES Items(Id)
);
GO


CREATE TABLE NIRDetail (
    NIR_Detail_Id INT NOT NULL,                     -- identificator unic linie NIR
    NIR_Id INT NOT NULL,                          -- FK către NIR (document recepție)
    Line_Number INT NOT NULL,                     -- număr linie
    Item_Id INT NOT NULL,                         -- cod produs
    Qtty_Ordered DECIMAL(18,2) NOT NULL,          -- cantitate comandată
    Quantity_Received DECIMAL(18,2) NOT NULL,     -- cantitatea recepționată
    Unit_Price DECIMAL(18,2) NOT NULL,             -- cost unitar la recepție
    VAT_Rate DECIMAL(5,2) NULL,              -- cotă TVA
    Line_Subtotal AS (Quantity_Received * Unit_Price),
    Line_Tax_Amount AS (
        CASE 
            WHEN VAT_Rate IS NULL THEN 0
            ELSE (Quantity_Received * Unit_Price) * (VAT_Rate / 100)
        END
    ),
    Line_Total AS (
        (Quantity_Received * Unit_Price) + 
        CASE 
            WHEN VAT_Rate IS NULL THEN 0
            ELSE (Quantity_Received * Unit_Price) * (VAT_Rate / 100)
        END
    ),

    CONSTRAINT PK_NIRDetail PRIMARY KEY (NIR_Detail_Id),

    CONSTRAINT FK_NIRDetail_DocumentDetail FOREIGN KEY (NIR_Detail_Id)
        REFERENCES Document_Detail(Id),        

    CONSTRAINT FK_NIRDetail_NIR FOREIGN KEY (NIR_Id)
        REFERENCES NIR(Id),

    CONSTRAINT FK_NIRDetail_Item FOREIGN KEY (Item_Id)
        REFERENCES Items(Id)
);
GO


CREATE TABLE CreditNoteDetail (
    CreditNote_Line_Id INT NOT NULL,               -- identificator unic linie
    CreditNote_Id INT NOT NULL,                    -- FK către CreditNote
    Line_Number INT NOT NULL,                      -- număr linie
    Item_Id INT NULL,                              -- opțional – dacă se leagă cu Items
    UM VARCHAR(20) NULL,                           -- unitate de măsură
    Qtty DECIMAL(18,2) NOT NULL,               -- cantitate creditată
    Unit_Price DECIMAL(18,2) NOT NULL,             -- preț unitar fără TVA
    VAT_Rate DECIMAL(5,2) NOT NULL,                -- cota TVA
    Line_Subtotal AS (Qtty * Unit_Price),     -- valoare linie netă
    Line_Tax_Amount AS ((Qtty * Unit_Price) * (VAT_Rate / 100)),
    Line_Total AS (
        (Qtty * Unit_Price) +
        ((Qtty * Unit_Price) * (VAT_Rate / 100))
    ),
    Notes VARCHAR(MAX) NULL,                  -- observații

    CONSTRAINT PK_CreditNoteDetail PRIMARY KEY (CreditNote_Line_Id),

    CONSTRAINT FK_CreditNoteDetail_DocumentDetail FOREIGN KEY (CreditNote_Line_Id)
        REFERENCES Document_Detail(Id),

    CONSTRAINT FK_CreditNoteDetail_CreditNote FOREIGN KEY (CreditNote_Id)
        REFERENCES CreditNote(Id),

    CONSTRAINT FK_CreditNoteDetail_Item FOREIGN KEY (Item_Id)
        REFERENCES Items(Id)
);




CREATE TABLE Stock_Log (
    Id INT IDENTITY(1,1) NOT NULL,
    Item_Id INT NOT NULL,                -- FK → Items.Id
    Document_Detail_Id INT NOT NULL,     -- FK → Document_Detail.Id
    Qtty DECIMAL(18,2) NOT NULL,         -- cantitatea mutată
    Movement_Type TINYINT NOT NULL,      -- 1 = ieșire, 2 = intrare
    Log_Date DATETIME NOT NULL DEFAULT GETDATE(),  -- timestamp intrare log

    CONSTRAINT PK_StockLog PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_StockLog_Item
        FOREIGN KEY (Item_Id) REFERENCES Items(Id),

    CONSTRAINT FK_StockLog_DocumentDetail
        FOREIGN KEY (Document_Detail_Id) REFERENCES Document_Detail(Id)
);
GO
