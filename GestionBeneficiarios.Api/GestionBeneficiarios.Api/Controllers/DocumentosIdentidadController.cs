using System.Data;
using System.Data.SqlClient;
using GestionBeneficiarios.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace GestionBeneficiarios.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentosIdentidadController : ControllerBase
    {
        private readonly string _connectionString;

        public DocumentosIdentidadController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        // GET: /api/DocumentosIdentidad
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentoIdentidadDto>>> GetActivos()
        {
            var result = new List<DocumentoIdentidadDto>();

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand("sp_DocumentoIdentidad_ListarActivos", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    result.Add(new DocumentoIdentidadDto
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        Nombre = reader.GetString(reader.GetOrdinal("Nombre")),
                        Abreviatura = reader.GetString(reader.GetOrdinal("Abreviatura")),
                        Pais = reader.GetString(reader.GetOrdinal("Pais")),
                        Longitud = reader.GetInt32(reader.GetOrdinal("Longitud")),
                        SoloNumeros = reader.GetBoolean(reader.GetOrdinal("SoloNumeros")),
                        Activo = reader.GetBoolean(reader.GetOrdinal("Activo"))
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error al obtener documentos de identidad", detail = ex.Message });
            }
        }
    }
}