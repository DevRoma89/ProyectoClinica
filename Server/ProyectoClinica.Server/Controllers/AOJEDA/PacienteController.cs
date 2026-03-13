using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.DTOs.AOJEDA.PacienteDTOs;
using ProyectoClinica.Shared.DTOs.AOJEDA.MedicoDTOs;
using ProyectoClinica.Shared.Entidades;
using ProyectoClinica.Shared.Entidades.EROMAN;

namespace ProyectoClinica.Server.Controllers.AOJEDA
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacienteController:ControllerBase
    {

        private readonly AppDbContext context;

        public PacienteController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<PacienteGetDTO>>> Get()
        {
            return await context.Pacientes 
                .Where(x => x.Visible == true)
                .Select(x => PacienteGetDTO.EntityToDto(x))
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] PacientePostDTO paciente)
        {
            if (string.IsNullOrEmpty(paciente.Nombre))
            {
                return BadRequest("No puede agregar un paciente con nombre vacio");
            }
            if (string.IsNullOrEmpty(paciente.Apellido))
            {
                return BadRequest("No puede agregar un paciente con apellido vacio");
            }
              
            var existeDocumento = await context.Pacientes.AnyAsync(x => x.Documento == paciente.Documento);

            if (existeDocumento)
            {
                return BadRequest("Ya existe un paciente con ese documento");
            }

            var existeEmail = await context.Pacientes.AnyAsync(x => x.Email == paciente.Email);

            if (existeEmail)
            {
                return BadRequest("Ya existe un paciente con ese email");
            }

            var entity = PacientePostDTO.DtoToEntity(paciente);

            context.Pacientes.Add(entity);

            await context.SaveChangesAsync();

            var historiaClinica = new HistoriaClinica
            {
                PacienteId = entity.Id
            }; 

            context.HistoriaClinicas.Add(historiaClinica);
            await context.SaveChangesAsync();   


            return Ok("Se ha registrado un nuevo paciente");
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] PacientePutDTO dto)
        {

            var paciente = await context.Pacientes.FindAsync(dto.Id); 


            var entity = PacientePutDTO.DtoToEntity(dto,paciente);

            context.Pacientes.Update(entity);
            await context.SaveChangesAsync();

            return Ok("Se ha actualizado un paciente");
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id)
        {
            var existe = await context.Pacientes.FirstOrDefaultAsync(x => x.Id == id);

            if (existe == null)
            {
                return NotFound("No se encontro un paciente con ese Id");
            }

            existe.Visible = false;
            await context.SaveChangesAsync();

            return Ok("Se ha borrado un paciente");
        }
    }
}
