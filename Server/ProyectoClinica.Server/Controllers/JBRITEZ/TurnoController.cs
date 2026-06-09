using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.DTOs.JBRITEZ.TurnoDTOs; 

namespace ProyectoClinica.Server.Controllers.JBRITEZ
{
    [ApiController]
    [Route("api/[controller]")]
    public class TurnoController : ControllerBase
    {

        private readonly AppDbContext context;

        public TurnoController(AppDbContext context)
        {
            this.context = context;
        }
   

        [HttpGet]
        public async Task<ActionResult<List<TurnoGetDTO>>> GetAll()
        {

            return await context.Turnos
                                .Include(x => x.Paciente)
                                .Include(x => x.Medico)
                                .Where(x => x.Visible == true)
                                .Select(x => TurnoGetDTO.EntityToDTO(x))
                                .ToListAsync();
        }
        
        [HttpGet("{fecha:datetime}")]
        public async Task<ActionResult<List<TurnoGetDTO>>> GetByDate([FromRoute] DateTime fecha)
        {

            return await context.Turnos
                                .Include(x => x.Paciente)
                                .Include(x => x.Medico)
                                .Where(x => x.Visible == true && x.Fecha == fecha)
                                .Select(x => TurnoGetDTO.EntityToDTO(x))
                                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post(TurnoPostDTO dto)
        {

            var existeMedico = await context.Medicos.AnyAsync(x => x.Id == dto.MedicoId);

            if (!existeMedico)
            {
                return NotFound("No se encontro un medico con ese Id");
            }

            var existePaciente = await context.Pacientes.AnyAsync(x => x.Id == dto.PacienteId);

            if (!existePaciente)
            {
                return NotFound("No se encontro un paciente con ese Id");
            }
            var horaInicio = new TimeSpan();
            var horaFin = new TimeSpan();
            try
            {
                horaInicio = TimeSpan.Parse(dto.HoraInicio);
                horaFin = TimeSpan.Parse(dto.HoraFin);

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al convertir a formato horario", ErrorMessage = ex.Message });
            }

            var noDisponible = await context.Turnos
                                            .AnyAsync(x => x.Fecha == dto.Fecha &&
                                                          x.MedicoId == dto.MedicoId &&
                                                          x.HoraInicio < horaFin &&
                                                          x.HoraFin > horaInicio);
            if (noDisponible)
            {
                return BadRequest("No puede agendar un turno que solape a otro");
            }

            var turno = TurnoPostDTO.DtoToEntity(dto);

            context.Add(turno);

            await context.SaveChangesAsync();

            return Ok("Turno Agendado con Exito");
        }

        [HttpPut]
        public async Task<ActionResult> Put(TurnoPutDTO dto)
        {
            var turnoExistente = await context.Turnos.FindAsync(dto.Id);
            if (turnoExistente == null)
            {
                return NotFound("No se encontró el turno");
            }

            var horaInicio = new TimeSpan();
            var horaFin = new TimeSpan();
            try
            {
                horaInicio = TimeSpan.Parse(dto.HoraInicio);
                horaFin = TimeSpan.Parse(dto.HoraFin);

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error al convertir a formato horario", ErrorMessage = ex.Message });
            }

            var noDisponible = await context.Turnos
                                            .AnyAsync(x => x.Id != dto.Id &&
                                                           x.Fecha == dto.Fecha &&
                                                           x.MedicoId == dto.MedicoId &&
                                                           x.HoraInicio < horaFin &&
                                                           x.HoraFin > horaInicio);
            if (noDisponible)
            {
                return BadRequest("No puede agendar un turno que solape a otro");
            }

            var turno = TurnoPutDTO.DtoToEntity(dto, turnoExistente);

            await context.SaveChangesAsync();

            return Ok("Turno Actualizado Correctamente");
        }
        //----

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id)
        {
            var turnoExistente = await context.Turnos.FindAsync(id);
            if (turnoExistente == null)
            {
                return NotFound("No se encontró el turno");
            }

            turnoExistente.FechaCancelacion = DateTime.Now;
            turnoExistente.Visible = false;

            await context.SaveChangesAsync();

            return Ok();
        }
    }
}