------------------------------------------------------------
--  INSERTAR REGISTROS DE DOCUMENTOS DE IDENTIDAD
------------------------------------------------------------
INSERT INTO DocumentoIdentidad (Nombre, Abreviatura, Pais, Longitud, SoloNumeros, Activo)
VALUES
('Documento Nacional de Identidad', 'DNI', 'Perú', 8, 1, 1),   
('Pasaporte', 'PAS', 'Perú', 9, 0, 1),                        
('Carné de Extranjería', 'CE', 'Perú', 9, 1, 1),              
('DNI Argentina', 'DNI', 'Argentina', 8, 1, 1),               
('Pasaporte Chile', 'PAS', 'Chile', 9, 0, 0);                 
GO


SELECT * FROM DocumentoIdentidad;
GO