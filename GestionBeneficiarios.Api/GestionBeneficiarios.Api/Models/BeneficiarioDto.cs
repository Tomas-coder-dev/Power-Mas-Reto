namespace GestionBeneficiarios.Api.Models
{
    public class BeneficiarioDto
    {
        public int Id { get; set; }
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public int DocumentoIdentidadId { get; set; }
        public string NombreDocumento { get; set; } = string.Empty;
        public string Abreviatura { get; set; } = string.Empty;
        public string NumeroDocumento { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public char Sexo { get; set; }
    }

    public class CreateBeneficiarioDto
    {
        public string Nombres { get; set; } = string.Empty;
        public string Apellidos { get; set; } = string.Empty;
        public int DocumentoIdentidadId { get; set; }
        public string NumeroDocumento { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public char Sexo { get; set; }
    }

    public class UpdateBeneficiarioDto : CreateBeneficiarioDto
    {
        public int Id { get; set; }
    }
}