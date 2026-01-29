using System.Data;
using System.Data.SqlClient;
using GestionBeneficiarios.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace GestionBeneficiarios.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BeneficiariosController : ControllerBase
    {
        private readonly string _connectionString;

        public BeneficiariosController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        // GET: /api/Beneficiarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BeneficiarioDto>>> GetAll()
        {
            var lista = new List<BeneficiarioDto>();

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand("sp_Beneficiario_Listar", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    lista.Add(new BeneficiarioDto
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        Nombres = reader.GetString(reader.GetOrdinal("Nombres")),
                        Apellidos = reader.GetString(reader.GetOrdinal("Apellidos")),
                        DocumentoIdentidadId = reader.GetInt32(reader.GetOrdinal("DocumentoIdentidadId")),
                        NombreDocumento = reader.GetString(reader.GetOrdinal("NombreDocumento")),
                        Abreviatura = reader.GetString(reader.GetOrdinal("Abreviatura")),
                        NumeroDocumento = reader.GetString(reader.GetOrdinal("NumeroDocumento")),
                        FechaNacimiento = reader.GetDateTime(reader.GetOrdinal("FechaNacimiento")),
                        Sexo = reader.GetString(reader.GetOrdinal("Sexo"))[0]
                    });
                }

                return Ok(lista);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error al obtener beneficiarios", detail = ex.Message });
            }
        }

        // GET: /api/Beneficiarios/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<BeneficiarioDto>> GetById(int id)
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand("sp_Beneficiario_ObtenerPorId", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };
                cmd.Parameters.AddWithValue("@Id", id);

                await conn.OpenAsync();
                using var reader = await cmd.ExecuteReaderAsync();

                if (!await reader.ReadAsync())
                {
                    return NotFound(new { message = "Beneficiario no encontrado" });
                }

                var dto = new BeneficiarioDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Nombres = reader.GetString(reader.GetOrdinal("Nombres")),
                    Apellidos = reader.GetString(reader.GetOrdinal("Apellidos")),
                    DocumentoIdentidadId = reader.GetInt32(reader.GetOrdinal("DocumentoIdentidadId")),
                    NombreDocumento = reader.GetString(reader.GetOrdinal("NombreDocumento")),
                    Abreviatura = reader.GetString(reader.GetOrdinal("Abreviatura")),
                    NumeroDocumento = reader.GetString(reader.GetOrdinal("NumeroDocumento")),
                    FechaNacimiento = reader.GetDateTime(reader.GetOrdinal("FechaNacimiento")),
                    Sexo = reader.GetString(reader.GetOrdinal("Sexo"))[0]
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error al obtener beneficiario", detail = ex.Message });
            }
        }

        // POST: /api/Beneficiarios
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateBeneficiarioDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand("sp_Beneficiario_Crear", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@Nombres", model.Nombres);
                cmd.Parameters.AddWithValue("@Apellidos", model.Apellidos);
                cmd.Parameters.AddWithValue("@DocumentoIdentidadId", model.DocumentoIdentidadId);
                cmd.Parameters.AddWithValue("@NumeroDocumento", model.NumeroDocumento);
                cmd.Parameters.AddWithValue("@FechaNacimiento", model.FechaNacimiento);
                cmd.Parameters.AddWithValue("@Sexo", model.Sexo);

                await conn.OpenAsync();
                var nuevoId = await cmd.ExecuteScalarAsync();

                return CreatedAtAction(nameof(GetById), new { id = Convert.ToInt32(nuevoId) }, new { id = nuevoId });
            }
            catch (SqlException ex)
            {
                // Mensajes de RAISERROR desde los SP (validaciones de negocio)
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error al crear beneficiario", detail = ex.Message });
            }
        }

        // PUT: /api/Beneficiarios/5
        [HttpPut("{id:int}")]
        public async Task<ActionResult> Update(int id, [FromBody] UpdateBeneficiarioDto model)
        {
            if (id != model.Id)
                return BadRequest(new { message = "El id de la URL no coincide con el del cuerpo" });

            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand("sp_Beneficiario_Actualizar", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@Id", model.Id);
                cmd.Parameters.AddWithValue("@Nombres", model.Nombres);
                cmd.Parameters.AddWithValue("@Apellidos", model.Apellidos);
                cmd.Parameters.AddWithValue("@DocumentoIdentidadId", model.DocumentoIdentidadId);
                cmd.Parameters.AddWithValue("@NumeroDocumento", model.NumeroDocumento);
                cmd.Parameters.AddWithValue("@FechaNacimiento", model.FechaNacimiento);
                cmd.Parameters.AddWithValue("@Sexo", model.Sexo);

                await conn.OpenAsync();
                await cmd.ExecuteNonQueryAsync();

                return NoContent();
            }
            catch (SqlException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error al actualizar beneficiario", detail = ex.Message });
            }
        }

        // DELETE: /api/Beneficiarios/5
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                using var cmd = new SqlCommand("sp_Beneficiario_Eliminar", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                cmd.Parameters.AddWithValue("@Id", id);

                await conn.OpenAsync();
                var affected = await cmd.ExecuteNonQueryAsync();

                if (affected == 0)
                    return NotFound(new { message = "Beneficiario no encontrado" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "Error al eliminar beneficiario", detail = ex.Message });
            }
        }
    }
}