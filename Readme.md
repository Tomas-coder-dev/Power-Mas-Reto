# Sistema de Gestión de Beneficiarios

Aplicación full‑stack para la gestión de beneficiarios, desarrollada como prueba técnica.  
Incluye:

- **Backend**: ASP.NET Core Web API + SQL Server + Stored Procedures
- **Frontend**: React + TypeScript + Vite + TailwindCSS

---

## 1. Requisitos previos

Asegúrate de tener instalado:

- **.NET 8 SDK** (o la versión usada en el proyecto)
- **SQL Server** (local o remoto)
- **Node.js** 18+ y **npm**
- Un IDE recomendado:
  - Backend: Visual Studio / VS Code
  - Frontend: VS Code

---

## 2. Estructura del repositorio

```text
Prueba PowerMass/
├─ GestionBeneficiarios.Api/      # Backend ASP.NET Core Web API
└─ gestion-beneficiarios-frontend/ # Frontend React + Vite + Tailwind
```

---

## 3. Backend – ASP.NET Core Web API

### 3.1. Configuración de la cadena de conexión

Editar `GestionBeneficiarios.Api/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=GestionBeneficiarios;User Id=USUARIO;Password=CLAVE;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

> Reemplazar `USUARIO`, `CLAVE` y el nombre de instancia de SQL Server según tu entorno.

### 3.2. Endpoints principales

- `GET /api/DocumentosIdentidad`
  - Devuelve solo documentos de identidad **activos**.
- `GET /api/Beneficiarios`
- `GET /api/Beneficiarios/{id}`
- `POST /api/Beneficiarios`
- `PUT /api/Beneficiarios/{id}`
- `DELETE /api/Beneficiarios/{id}`

Todos los accesos a datos se realizan mediante **Stored Procedures**.

### 3.3. CORS

En `Program.cs` se habilita CORS para permitir el frontend en Vite:

```csharp
var corsPolicyName = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(corsPolicyName);
app.UseAuthorization();
app.MapControllers();
app.Run();
```

Si Vite corre en otro puerto, agregarlo a `WithOrigins`.

### 3.4. Ejecutar el backend

Desde la carpeta `GestionBeneficiarios.Api`:

```bash
dotnet restore
dotnet run
```

La API quedará disponible en una URL similar a:

- `https://localhost:7263`

Puedes probar:

- `https://localhost:7263/api/DocumentosIdentidad`
- `https://localhost:7263/api/Beneficiarios`

---

## 4. Base de datos – SQL Server

### 4.1. Creación de base de datos

```sql
CREATE DATABASE GestionBeneficiarios;
GO

USE GestionBeneficiarios;
GO
```

### 4.2. Tablas

```sql
-- Tabla de tipos de documento de identidad
CREATE TABLE DocumentoIdentidad (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    Nombre       NVARCHAR(100) NOT NULL,
    Abreviatura  NVARCHAR(10)  NOT NULL,
    Pais         NVARCHAR(50)  NOT NULL,
    Longitud     INT           NOT NULL,
    SoloNumeros  BIT           NOT NULL,
    Activo       BIT           NOT NULL DEFAULT (1)
);
GO

-- Tabla de beneficiarios
CREATE TABLE Beneficiario (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    Nombres             NVARCHAR(100) NOT NULL,
    Apellidos           NVARCHAR(100) NOT NULL,
    DocumentoIdentidadId INT          NOT NULL,
    NumeroDocumento     NVARCHAR(50)  NOT NULL,
    FechaNacimiento     DATE          NOT NULL,
    Sexo                CHAR(1)       NOT NULL,
    CONSTRAINT FK_Beneficiario_DocumentoIdentidad
        FOREIGN KEY (DocumentoIdentidadId)
        REFERENCES DocumentoIdentidad(Id)
);
GO
```

### 4.3. Datos iniciales

```sql
INSERT INTO DocumentoIdentidad (Nombre, Abreviatura, Pais, Longitud, SoloNumeros, Activo)
VALUES
('Documento Nacional de Identidad', 'DNI', 'Perú',       8, 1, 1),
('Pasaporte',                        'PAS', 'Perú',       9, 0, 1),
('Carné de Extranjería',             'CE',  'Perú',       9, 1, 1),
('DNI Argentina',                    'DNI', 'Argentina',  8, 1, 1);
GO

INSERT INTO Beneficiario
(Nombres, Apellidos, DocumentoIdentidadId, NumeroDocumento, FechaNacimiento, Sexo)
VALUES
('Juan', 'Pérez', 1, '12345678', '1990-01-01', 'M');
GO
```

### 4.4. Stored Procedures

```sql
-- Documentos activos
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
    ORDER BY Pais, Nombre;
END;
GO

-- Listar beneficiarios
CREATE OR ALTER PROCEDURE sp_Beneficiario_Listar
AS
BEGIN
    SET NOCOUNT ON;

    SELECT b.Id,
           b.Nombres,
           b.Apellidos,
           b.DocumentoIdentidadId,
           d.Nombre       AS NombreDocumento,
           d.Abreviatura,
           b.NumeroDocumento,
           b.FechaNacimiento,
           b.Sexo
    FROM Beneficiario b
    INNER JOIN DocumentoIdentidad d ON d.Id = b.DocumentoIdentidadId
    ORDER BY b.Apellidos, b.Nombres;
END;
GO

-- Obtener beneficiario por Id
CREATE OR ALTER PROCEDURE sp_Beneficiario_ObtenerPorId
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT b.Id,
           b.Nombres,
           b.Apellidos,
           b.DocumentoIdentidadId,
           d.Nombre       AS NombreDocumento,
           d.Abreviatura,
           b.NumeroDocumento,
           b.FechaNacimiento,
           b.Sexo
    FROM Beneficiario b
    INNER JOIN DocumentoIdentidad d ON d.Id = b.DocumentoIdentidadId
    WHERE b.Id = @Id;
END;
GO

-- Crear beneficiario (con validaciones de negocio de ejemplo)
CREATE OR ALTER PROCEDURE sp_Beneficiario_Crear
    @Nombres             NVARCHAR(100),
    @Apellidos           NVARCHAR(100),
    @DocumentoIdentidadId INT,
    @NumeroDocumento     NVARCHAR(50),
    @FechaNacimiento     DATE,
    @Sexo                CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: documento único por tipo
    IF EXISTS (
        SELECT 1
        FROM Beneficiario
        WHERE DocumentoIdentidadId = @DocumentoIdentidadId
          AND NumeroDocumento = @NumeroDocumento
    )
    BEGIN
        RAISERROR('Ya existe un beneficiario con ese tipo y número de documento.', 16, 1);
        RETURN;
    END;

    INSERT INTO Beneficiario
        (Nombres, Apellidos, DocumentoIdentidadId, NumeroDocumento, FechaNacimiento, Sexo)
    VALUES
        (@Nombres, @Apellidos, @DocumentoIdentidadId, @NumeroDocumento, @FechaNacimiento, @Sexo);

    SELECT SCOPE_IDENTITY() AS Id;
END;
GO

-- Actualizar beneficiario
CREATE OR ALTER PROCEDURE sp_Beneficiario_Actualizar
    @Id                  INT,
    @Nombres             NVARCHAR(100),
    @Apellidos           NVARCHAR(100),
    @DocumentoIdentidadId INT,
    @NumeroDocumento     NVARCHAR(50),
    @FechaNacimiento     DATE,
    @Sexo                CHAR(1)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Beneficiario WHERE Id = @Id)
    BEGIN
        RAISERROR('Beneficiario no encontrado.', 16, 1);
        RETURN;
    END;

    UPDATE Beneficiario
    SET Nombres             = @Nombres,
        Apellidos           = @Apellidos,
        DocumentoIdentidadId = @DocumentoIdentidadId,
        NumeroDocumento     = @NumeroDocumento,
        FechaNacimiento     = @FechaNacimiento,
        Sexo                = @Sexo
    WHERE Id = @Id;
END;
GO

-- Eliminar beneficiario
CREATE OR ALTER PROCEDURE sp_Beneficiario_Eliminar
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM Beneficiario
    WHERE Id = @Id;
END;
GO
```

---

## 5. Frontend – React + Vite + TailwindCSS

### 5.1. Instalación

Desde la carpeta `gestion-beneficiarios-frontend`:

```bash
npm install
```

Tailwind se configuró con **versión 3** para evitar problemas de compatibilidad:

```bash
npm install -D tailwindcss@3.4.17 postcss autoprefixer
```

Archivos clave:

#### `tailwind.config.cjs`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### `postcss.config.cjs`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5.2. Variables importantes

En los servicios de API se usa una URL base:

```ts
const BASE_URL = "https://localhost:7263/api";
```

Si el backend corre en otra URL/puerto (o sin HTTPS), actualizarla en:

- `src/api/documentosApi.ts`
- `src/api/beneficiariosApi.ts`

### 5.3. Ejecutar el frontend

Desde `gestion-beneficiarios-frontend`:

```bash
npm run dev
```

Abrir el navegador en la URL que muestre Vite, por ejemplo:

- `http://localhost:5173`
- `http://localhost:5174`

La aplicación muestra:

- Formulario de registro de beneficiario:
  - Select dinámico de tipo de documento (desde la API).
  - Validación de longitud y formato (solo números vs alfanumérico) según los datos del documento.
- Tabla con el listado de beneficiarios:
  - Datos obtenidos desde la API.
  - Opción para eliminar un beneficiario.

---

## 6. Flujo para levantar todo el proyecto

1. **Base de datos**
   - Ejecutar los scripts de:
     - Creación de BD y tablas.
     - Datos iniciales.
     - Stored procedures.

2. **Backend**
   - Configurar `appsettings.json` con la cadena de conexión.
   - En `GestionBeneficiarios.Api`:

     ```bash
     dotnet restore
     dotnet run
     ```

3. **Frontend**
   - En `gestion-beneficiarios-frontend`:

     ```bash
     npm install
     npm run dev
     ```

4. Abrir el navegador en la URL de Vite y probar la aplicación completa.

---

## 7. Notas

- Toda la lógica de acceso a datos se realiza mediante **Stored Procedures**, cumpliendo el requisito de la prueba.
- La validación del documento se realiza en **dos capas**:
  - Frontend: longitud y tipo de caracteres según configuración del documento.
  - Backend / BD: validaciones adicionales en los stored procedures (por ejemplo, documento único).