SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[usp_Add_Invoice_Header]
    @User_Id INT,
    @Invoice_Number NVARCHAR(100),
    @Invoice_Date DATE,
    @Invoice_Type INT,                  -- 1 = Intrare (Furnizor), 2 = Iesire (Client)
    @Supplier_Id INT = NULL,            -- Obligatoriu daca Type=1
    @Client_Id INT = NULL,              -- Obligatoriu daca Type=2
    @Currency_Code CHAR(3),
    @Exchange_Rate DECIMAL(18,6) = 1,
    @Payment_Terms NVARCHAR(50) = NULL,
    @Due_Date DATE = NULL,
    @Order_Id INT = NULL,
    @Shipping_Address INT = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @New_Invoice_Id INT OUTPUT          -- Returnam ID-ul facturii
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validare: Daca e Intrare (1) -> Client NULL; Daca e Iesire (2) -> Supplier NULL
        IF @Invoice_Type = 1 SET @Client_Id = NULL;
        IF @Invoice_Type = 2 SET @Supplier_Id = NULL;

        -- 1. Insert in Document (Generic)
        INSERT INTO Document (User_Id, Document_State, Document_Date, Document_Type)
        VALUES (@User_Id, 'Draft', @Invoice_Date, 'Factura');

        DECLARE @New_Doc_Id INT = SCOPE_IDENTITY();

        -- 2. Insert in Invoice
        INSERT INTO Invoice (
            Document_Id, Invoice_Number, Invoice_Date, Invoice_Type,
            Supplier_Id, Client_Id, Shipping_Address,
            Currency_Code, Exchange_Rate, Payment_Terms, Due_Date,
            Order_Id, Notes, Amount, Tax_Total
        )
        VALUES (
            @New_Doc_Id, @Invoice_Number, @Invoice_Date, @Invoice_Type,
            @Supplier_Id, @Client_Id, @Shipping_Address,
            @Currency_Code, @Exchange_Rate, @Payment_Terms, @Due_Date,
            @Order_Id, @Notes, 0, 0
        );

        SET @New_Invoice_Id = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[usp_Add_Invoice_Line]
    @Invoice_Id INT,
    @Item_Id INT,
    @Qtty DECIMAL(18,2),
    @Unit_Price DECIMAL(18,2),
    @VAT_Rate DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- A. Identificare Document parinte
        DECLARE @Parent_Document_Id INT;
        SELECT @Parent_Document_Id = Document_Id 
        FROM Invoice 
        WHERE Id = @Invoice_Id;

        IF @Parent_Document_Id IS NULL
            THROW 50001, 'Factura (Invoice_Id) nu a fost gasita.', 1;

        -- B. Insert in Document_Detail
        -- Acesta este pasul CRITIC pentru a genera ID-ul folosit ca PK in InvoiceDetail
        INSERT INTO Document_Detail (Document_Id, Item_Id, Qtty, Unit_Price, Tax_Rate)
        VALUES (@Parent_Document_Id, @Item_Id, @Qtty, @Unit_Price, @VAT_Rate);

        DECLARE @Generated_Detail_Id INT = SCOPE_IDENTITY();

        -- C. Calcul Line_Number
        DECLARE @New_Line_Number INT;
        SELECT @New_Line_Number = ISNULL(MAX(Line_Number), 0) + 1 
        FROM InvoiceDetail 
        WHERE Invoice_Id = @Invoice_Id;

        -- D. Insert in InvoiceDetail (FARA STOCK LOG)
        INSERT INTO InvoiceDetail (Invoice_Detail_Id, Invoice_Id, Line_Number, Item_Id, Qtty, Unit_Price, VAT_Rate)
        VALUES (@Generated_Detail_Id, @Invoice_Id, @New_Line_Number, @Item_Id, @Qtty, @Unit_Price, @VAT_Rate);

        -- E. Recalculare Totaluri pe Antet (Invoice)
        DECLARE @Total_Net DECIMAL(18,2);
        DECLARE @Total_Tax DECIMAL(18,2);

        SELECT 
            @Total_Net = SUM(Qtty * Unit_Price),
            @Total_Tax = SUM((Qtty * Unit_Price) * (VAT_Rate / 100))
        FROM InvoiceDetail
        WHERE Invoice_Id = @Invoice_Id;

        UPDATE Invoice
        SET 
            Amount = ISNULL(@Total_Net, 0),
            Tax_Total = ISNULL(@Total_Tax, 0)
        WHERE Id = @Invoice_Id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[usp_Add_NIR_Header]
    @User_Id INT,
    @Nir_Number NVARCHAR(100),
    @Nir_Date DATE,
    @Supplier_Id INT,                   -- Furnizorul este obligatoriu la NIR
    @Currency_Code CHAR(3),
    @Exchange_Rate DECIMAL(18,6) = 1,
    @IsVRN INT = 0,                     -- 0 = NIR normal, 1 = Valorificarea rezultate (daca e cazul)
    @Notes NVARCHAR(MAX) = NULL,
    @New_NIR_Id INT OUTPUT              -- Returnam ID-ul NIR-ului creat
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- 1. Insert in Document (Generic)
        -- Tipul documentului setat ca 'NIR'
        INSERT INTO Document (User_Id, Document_State, Document_Date, Document_Type)
        VALUES (@User_Id, 'Draft', @Nir_Date, 'NIR');

        DECLARE @New_Doc_Id INT = SCOPE_IDENTITY();

        -- 2. Insert in NIR
        INSERT INTO NIR (
            Document_Id, Nir_Number, Nir_Date, IsVRN, 
            Supplier_Id, Currency_Code, Exchange_Rate, 
            Amount, Tax_Amount, Notes
        )
        VALUES (
            @New_Doc_Id, @Nir_Number, @Nir_Date, @IsVRN,
            @Supplier_Id, @Currency_Code, @Exchange_Rate,
            0, 0, @Notes
        );

        SET @New_NIR_Id = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[usp_Add_NIR_Line]
    @NIR_Id INT,
    @Item_Id INT,
    @Qtty_Ordered DECIMAL(18,2),      -- Cantitatea din comanda (informativ/control)
    @Quantity_Received DECIMAL(18,2), -- Cantitatea reala intrata in stoc
    @Unit_Price DECIMAL(18,2),        -- Pretul de achizitie
    @VAT_Rate DECIMAL(5,2) = NULL     -- Poate fi NULL conform tabelului
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- A. Identificare Document parinte
        DECLARE @Parent_Document_Id INT;
        SELECT @Parent_Document_Id = Document_Id 
        FROM NIR 
        WHERE Id = @NIR_Id;

        IF @Parent_Document_Id IS NULL
            THROW 50001, 'NIR-ul (Id) specificat nu a fost gasit.', 1;

        -- B. Insert in Document_Detail
        -- ATENTIE: In tabelul generic Document_Detail punem cantitatea care are impact (Recepționată)
        INSERT INTO Document_Detail (Document_Id, Item_Id, Qtty, Unit_Price, Tax_Rate)
        VALUES (@Parent_Document_Id, @Item_Id, @Quantity_Received, @Unit_Price, ISNULL(@VAT_Rate, 0));

        DECLARE @Generated_Detail_Id INT = SCOPE_IDENTITY();

        -- C. Calcul Line_Number
        DECLARE @New_Line_Number INT;
        SELECT @New_Line_Number = ISNULL(MAX(Line_Number), 0) + 1 
        FROM NIRDetail 
        WHERE NIR_Id = @NIR_Id;

        -- D. Insert in NIRDetail
        -- Folosim @Generated_Detail_Id pentru PK
        INSERT INTO NIRDetail (
            NIR_Detail_Id, NIR_Id, Line_Number, Item_Id, 
            Qtty_Ordered, Quantity_Received, Unit_Price, VAT_Rate
        )
        VALUES (
            @Generated_Detail_Id, @NIR_Id, @New_Line_Number, @Item_Id, 
            @Qtty_Ordered, @Quantity_Received, @Unit_Price, @VAT_Rate
        );

        -- E. Insert in Stock_Log (MISCARE STOC)
        -- Movement_Type = 2 (Intrare), conform logicii stabilite anterior
        -- Logam doar cantitatea receptionata
        INSERT INTO Stock_Log (Item_Id, Document_Detail_Id, Qtty, Movement_Type, Log_Date)
        VALUES (@Item_Id, @Generated_Detail_Id, @Quantity_Received, 2, GETDATE());

        -- F. Recalculare Totaluri pe Antet (NIR)
        -- Trebuie sa tratam cazul in care VAT_Rate este NULL
        DECLARE @Total_Net DECIMAL(18,2);
        DECLARE @Total_Tax DECIMAL(18,2);

        SELECT 
            @Total_Net = SUM(Quantity_Received * Unit_Price),
            @Total_Tax = SUM((Quantity_Received * Unit_Price) * (ISNULL(VAT_Rate, 0) / 100))
        FROM NIRDetail
        WHERE NIR_Id = @NIR_Id;

        UPDATE NIR
        SET 
            Amount = ISNULL(@Total_Net, 0),
            Tax_Amount = ISNULL(@Total_Tax, 0)
        WHERE Id = @NIR_Id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[usp_Add_Order_Header]
    @User_Id INT,
    @Document_Type NVARCHAR(50),      -- Ex: 'Factura', 'Aviz'
    @Order_Number VARCHAR(50),
    @Order_Date DATE,
    @Order_Type INT,                  -- 1 = Intrare (Furnizor), 2 = Iesire (Client)
    @Supplier_Id INT = NULL,          -- Se completeaza daca Type=1
    @Client_Id INT = NULL,            -- Se completeaza daca Type=2
    @Currency_Code CHAR(3),
    @Exchange_Rate DECIMAL(18,6),
    @Shipping_Address INT = NULL,
    @Notes NVARCHAR(MAX) = NULL,
    @New_Order_Id INT OUTPUT          -- Returnam ID-ul comenzii create
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validare Constraint CHECK din SQL
        -- Daca e tip 1, Client trebuie sa fie NULL. Daca e 2, Supplier trebuie sa fie NULL.
        IF @Order_Type = 1 SET @Client_Id = NULL;
        IF @Order_Type = 2 SET @Supplier_Id = NULL;

        -- 1. Insert in Document (Genereaza ID identity)
        INSERT INTO Document (User_Id, Document_State, Document_Date, Document_Type)
        VALUES (@User_Id, 'Draft', @Order_Date, @Document_Type);

        DECLARE @New_Doc_Id INT = SCOPE_IDENTITY();

        -- 2. Insert in Order (Foloseste Doc ID, Genereaza Order ID identity)
        INSERT INTO [Order] (
            Document_Id, Order_Number, Order_Date, Order_Type, 
            Supplier_Id, Client_Id, Currency_Code, Exchange_Rate, 
            Shipping_Address, Notes, Amount, Tax_Amount
        )
        VALUES (
            @New_Doc_Id, @Order_Number, @Order_Date, @Order_Type,
            @Supplier_Id, @Client_Id, @Currency_Code, @Exchange_Rate,
            @Shipping_Address, @Notes, 0, 0
        );

        SET @New_Order_Id = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   PROCEDURE [dbo].[usp_Add_Order_Line]
    @Order_Id INT,
    @Item_Id INT,
    @Qtty DECIMAL(18,2),
    @Unit_Price DECIMAL(18,2),
    @VAT_Rate DECIMAL(5,2)   -- Ex: 19.00
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- A. Obtinem informatii din antet necesare pentru logica
        DECLARE @Parent_Document_Id INT;
        DECLARE @Order_Type INT;

        SELECT 
            @Parent_Document_Id = Document_Id, 
            @Order_Type = Order_Type
        FROM [Order] 
        WHERE Id = @Order_Id;

        IF @Parent_Document_Id IS NULL
            THROW 50001, 'Comanda (Order_Id) nu a fost gasita.', 1;

        -- B. Insert in Document_Detail
        -- Aici se genereaza ID-ul unic care va fi folosit si in OrderDetail
        INSERT INTO Document_Detail (Document_Id, Item_Id, Qtty, Unit_Price, Tax_Rate)
        VALUES (@Parent_Document_Id, @Item_Id, @Qtty, @Unit_Price, @VAT_Rate);

        DECLARE @Generated_Detail_Id INT = SCOPE_IDENTITY();

        -- C. Calculam Line_Number (incrementare manuala per comanda)
        DECLARE @New_Line_Number INT;
        SELECT @New_Line_Number = ISNULL(MAX(Line_Number), 0) + 1 
        FROM OrderDetail 
        WHERE Order_Id = @Order_Id;

        -- D. Insert in OrderDetail
        -- ATENTIE: Order_Detail_Id NU este identity aici, este FK catre Document_Detail.Id
        -- Introducem ID-ul generat la pasul B.
        INSERT INTO OrderDetail (Order_Detail_Id, Order_Id, Line_Number, Item_Id, Qtty, Unit_Price, VAT_Rate)
        VALUES (@Generated_Detail_Id, @Order_Id, @New_Line_Number, @Item_Id, @Qtty, @Unit_Price, @VAT_Rate);


        -- F. Actualizare Totaluri in tabelul Order (Header)
        -- Recalculam suma tuturor liniilor din acea comanda
        -- Se tine cont ca in OrderDetail coloanele Line_Subtotal si Line_Tax_Amount sunt computed
        -- deci trebuie sa recalculam formula in SUM sau sa facem join
        
        DECLARE @Total_Net DECIMAL(18,2);
        DECLARE @Total_Tax DECIMAL(18,2);

        SELECT 
            @Total_Net = SUM(Qtty * Unit_Price),
            @Total_Tax = SUM((Qtty * Unit_Price) * (VAT_Rate / 100))
        FROM OrderDetail
        WHERE Order_Id = @Order_Id;

        UPDATE [Order]
        SET 
            Amount = ISNULL(@Total_Net, 0),
            Tax_Amount = ISNULL(@Total_Tax, 0)
        WHERE Id = @Order_Id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO
