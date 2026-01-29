------------------------------------------------------------
-- SCRIPT 03: FUNCIONES Y STORED PROCEDURES
------------------------------------------------------------

USE GestionBeneficiarios;
GO

------------------------------------------------------------
-- 1) FUNCIÓN AUXILIAR: Validar Solo Números
------------------------------------------------------------
CREATE OR ALTER FUNCTION fn_EsSoloNumeros (@valor VARCHAR(50))
RETURNS BIT
AS
BEGIN
    IF @valor LIKE '%[^0-9]%'
        RETURN 0;

    RETURN 1;
END;
GO

------------------------------------------------------------
-- 2) SP: Listar Documentos de Identidad Activos
------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_DocumentoIdentidad_ListarActivos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id,
           Nombre,
           Abreviatura,
           Pais,
           Longitud,
           SoloNumeros,
           Activo
    FROM DocumentoIdentidad
    WHERE Activo = 1
    ORDER BY Nombre;
END;
GO

------------------------------------------------------------
-- 3) SP: Listar Beneficiarios
------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_Beneficiario_Listar
AS
BEGIN
    SET NOCOUNT ON;

    SELECT b.Id,
           b.Nombres,
           b.Apellidos,
           b.DocumentoIdentidadId,
           d.Nombre AS NombreDocumento,
           d.Abreviatura,
           b.NumeroDocumento,
           b.FechaNacimiento,
           b.Sexo
    FROM Beneficiario b
    INNER JOIN DocumentoIdentidad d ON b.DocumentoIdentidadId = d.Id
    ORDER BY b.Apellidos, b.Nombres;
END;
GO

------------------------------------------------------------
-- 4) SP: Obtener Beneficiario por Id
------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_Beneficiario_ObtenerPorId
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT b.Id,
           b.Nombres,
           b.Apellidos,
           b.DocumentoIdentidadId,
           d.Nombre AS NombreDocumento,
           d.Abreviatura,
           b.NumeroDocumento,
           b.FechaNacimiento,
           b.Sexo
    FROM Beneficiario b
    INNER JOIN DocumentoIdentidad d ON b.DocumentoIdentidadId = d.Id
    WHERE b.Id = @Id;
END;
GO

------------------------------------------------------------
-- 5) SP: Crear Beneficiario (CON VALIDACIONES)
------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_Beneficiario_Crear
    @Nombres VARCHAR(100),
    @Apellidos VARCHAR(100),
    @DocumentoIdentidadId INT,
    @NumeroDocumento VARCHAR(20),
    @FechaNacimiento DATE,
    @Sexo CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @LongitudEsperada INT,
        @SoloNumeros BIT,
        @ExisteDoc BIT;

    ------------------------------------------------------------
    -- 5.1) Validar documento de identidad (existe y activo)
    ------------------------------------------------------------
    SELECT 
        @LongitudEsperada = Longitud,
        @SoloNumeros = SoloNumeros,
        @ExisteDoc = 1
    FROM DocumentoIdentidad
    WHERE Id = @DocumentoIdentidadId
      AND Activo = 1;

    IF (@ExisteDoc IS NULL)
    BEGIN
        RAISERROR('El tipo de documento no existe o no está activo.', 16, 1);
        RETURN;
    END

    ------------------------------------------------------------
    -- 5.2) Validar longitud del número de documento
    ------------------------------------------------------------
    IF (LEN(@NumeroDocumento) <> @LongitudEsperada)
    BEGIN
        RAISERROR('La longitud del Número de Documento debe ser %d caracteres.', 16, 1, @LongitudEsperada);
        RETURN;
    END

    ------------------------------------------------------------
    -- 5.3) Validar solo números (si corresponde)
    ------------------------------------------------------------
    IF (@SoloNumeros = 1 AND dbo.fn_EsSoloNumeros(@NumeroDocumento) = 0)
    BEGIN
        RAISERROR('El Número de Documento solo puede contener dígitos para este tipo de documento.', 16, 1);
        RETURN;
    END

    ------------------------------------------------------------
    -- 5.4) Validar sexo
    ------------------------------------------------------------
    IF (@Sexo NOT IN ('M', 'F'))
    BEGIN
        RAISERROR('El campo Sexo solo admite los valores M o F.', 16, 1);
        RETURN;
    END

    ------------------------------------------------------------
    -- 5.5) Insertar registro si todas las validaciones pasaron
    ------------------------------------------------------------
    INSERT INTO Beneficiario (Nombres, Apellidos, DocumentoIdentidadId, NumeroDocumento, FechaNacimiento, Sexo)
    VALUES (@Nombres, @Apellidos, @DocumentoIdentidadId, @NumeroDocumento, @FechaNacimiento, @Sexo);

    SELECT SCOPE_IDENTITY() AS NuevoId;
END;
GO

------------------------------------------------------------
-- 6) SP: Actualizar Beneficiario (CON VALIDACIONES)
------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_Beneficiario_Actualizar
    @Id INT,
    @Nombres VARCHAR(100),
    @Apellidos VARCHAR(100),
    @DocumentoIdentidadId INT,
    @NumeroDocumento VARCHAR(20),
    @FechaNacimiento DATE,
    @Sexo CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @LongitudEsperada INT,
        @SoloNumeros BIT,
        @ExisteDoc BIT,
        @ExisteBeneficiario BIT;

    ------------------------------------------------------------
    -- 6.1) Validar que el beneficiario exista
    ------------------------------------------------------------
    SELECT @ExisteBeneficiario = 1
    FROM Beneficiario
    WHERE Id = @Id;

    IF (@ExisteBeneficiario IS NULL)
    BEGIN
        RAISERROR('El beneficiario especificado no existe.', 16, 1);
        RETURN;
    END

    ------------------------------------------------------------
    -- 6.2) Validar documento de identidad (existe y activo)
    ------------------------------------------------------------
    SELECT 
        @LongitudEsperada = Longitud,
        @SoloNumeros = SoloNumeros,
        @ExisteDoc = 1
    FROM DocumentoIdentidad
    WHERE Id = @DocumentoIdentidadId
      AND Activo = 1;

    IF (@ExisteDoc IS NULL)
    BEGIN
        RAISERROR('El tipo de documento no existe o no está activo.', 16, 1);
        RETURN;
    END

    ------------------------------------------------------------
    -- 6.3) Validar longitud del número de documento
    ------------------------------------------------------------
    IF (LEN(@NumeroDocumento) <> @LongitudEsperada)
    BEGIN
        RAISERROR('La longitud del Número de Documento debe ser %d caracteres.', 16, 1, @LongitudEsperada);
        RETURN;
    END

    ------------------------------------------------------------
    -- 6.4) Validar solo números (si corresponde)
    ------------------------------------------------------------
    IF (@SoloNumeros = 1 AND dbo.fn_EsSoloNumeros(@NumeroDocumento) = 0)
    BEGIN
        RAISERROR('El Número de Documento solo puede contener dígitos para este tipo de documento.', 16, 1);
        RETURN;
    END

    ------------------------------------------------------------
    -- 6.5) Validar sexo
    ------------------------------------------------------------
    IF (@Sexo NOT IN ('M', 'F'))
    BEGIN
        RAISERROR('El campo Sexo solo admite los valores M o F.', 16, 1);
        RETURN;
    END

    ------------------------------------------------------------
    -- 6.6) Actualizar registro
    ------------------------------------------------------------
    UPDATE Beneficiario
    SET Nombres = @Nombres,
        Apellidos = @Apellidos,
        DocumentoIdentidadId = @DocumentoIdentidadId,
        NumeroDocumento = @NumeroDocumento,
        FechaNacimiento = @FechaNacimiento,
        Sexo = @Sexo
    WHERE Id = @Id;
END;
GO

------------------------------------------------------------
-- 7) SP: Eliminar Beneficiario
------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_Beneficiario_Eliminar
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Beneficiario WHERE Id = @Id;
END;
GO