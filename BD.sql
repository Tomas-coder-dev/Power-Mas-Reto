------------------------------------------------------------
-- Proyecto: Sistema de Gestión de Beneficiarios
------------------------------------------------------------

------------------------------------------------------------
--  CREAR BASE DE DATOS 
------------------------------------------------------------
CREATE DATABASE GestionBeneficiarios;
GO

USE GestionBeneficiarios;
GO


------------------------------------------------------------
--  TABLA DocumentoIdentidad
------------------------------------------------------------
CREATE TABLE DocumentoIdentidad (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,        
    Abreviatura VARCHAR(10) NOT NULL,   
    Pais VARCHAR(50) NOT NULL,          
    Longitud INT NOT NULL,              
    SoloNumeros BIT NOT NULL,           
    Activo BIT NOT NULL DEFAULT 1       
);
GO

------------------------------------------------------------
--  TABLA Beneficiario
--    Incluye restricción CHECK para Sexo (M/F)
------------------------------------------------------------
CREATE TABLE Beneficiario (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombres VARCHAR(100) NOT NULL,         
    Apellidos VARCHAR(100) NOT NULL,       
    DocumentoIdentidadId INT NOT NULL,      
    NumeroDocumento VARCHAR(20) NOT NULL,   
    FechaNacimiento DATE NOT NULL,          
    Sexo CHAR(1) NOT NULL,                  
    CONSTRAINT FK_Beneficiario_DocumentoIdentidad
        FOREIGN KEY (DocumentoIdentidadId) REFERENCES DocumentoIdentidad(Id),
    CONSTRAINT CK_Beneficiario_Sexo
        CHECK (Sexo IN ('M', 'F'))          
);
GO