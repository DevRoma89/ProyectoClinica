using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades.EROMAN;

namespace ProyectoClinica.Server.Controllers.EROMAN
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConsultaController : ControllerBase
    {
        private readonly AppDbContext context;

        public ConsultaController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Consulta>>> Get()
        {
            return await context.Consultas
                .Where(x => x.Visible == true)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Consulta consulta)
        {
            var existeHistoriaClinica = await context.HistoriaClinicas
                .AnyAsync(x => x.Id == consulta.HistoriaClinicaId && x.Visible == true);

            if (!existeHistoriaClinica)
            {
                return BadRequest("No existe una historia clinica con ese Id");
            }

            var existeMedico = await context.Medicos
                .AnyAsync(x => x.Id == consulta.MedicoId);

            if (!existeMedico)
            {
                return BadRequest("No existe un medico con ese Id");
            }

            if (consulta.TurnoId.HasValue)
            {
                var existeTurno = await context.Turnos
                    .AnyAsync(x => x.Id == consulta.TurnoId.Value);

                if (!existeTurno)
                {
                    return BadRequest("No existe un turno con ese Id");
                }
            }

            if (string.IsNullOrEmpty(consulta.MotivoConsulta))
            {
                return BadRequest("No puede agregar una consulta con motivo vacio");
            }

            if (string.IsNullOrEmpty(consulta.Diagnostico))
            {
                return BadRequest("No puede agregar una consulta con diagnostico vacio");
            }

            if (string.IsNullOrEmpty(consulta.Tratamiento))
            {
                return BadRequest("No puede agregar una consulta con tratamiento vacio");
            }

            if (string.IsNullOrEmpty(consulta.Observaciones))
            {
                return BadRequest("No puede agregar una consulta con observaciones vacias");
            }

            consulta.MotivoConsulta = consulta.MotivoConsulta.ToUpper();
            consulta.Diagnostico = consulta.Diagnostico.ToUpper();
            consulta.Tratamiento = consulta.Tratamiento.ToUpper();
            consulta.Observaciones = consulta.Observaciones.ToUpper();
            consulta.Visible = true;

            context.Add(consulta);
            await context.SaveChangesAsync();

            return Ok("Se ha creado una consulta");
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Consulta consulta)
        {
            var existe = await context.Consultas
                .AnyAsync(x => x.Id == consulta.Id);

            if (!existe)
            {
                return NotFound("No se encontro una consulta con ese Id");
            }

            var existeHistoriaClinica = await context.HistoriaClinicas
                .AnyAsync(x => x.Id == consulta.HistoriaClinicaId && x.Visible == true);

            if (!existeHistoriaClinica)
            {
                return BadRequest("No existe una historia clinica con ese Id");
            }

            var existeMedico = await context.Medicos
                .AnyAsync(x => x.Id == consulta.MedicoId);

            if (!existeMedico)
            {
                return BadRequest("No existe un medico con ese Id");
            }

            if (consulta.TurnoId.HasValue)
            {
                var existeTurno = await context.Turnos
                    .AnyAsync(x => x.Id == consulta.TurnoId.Value);

                if (!existeTurno)
                {
                    return BadRequest("No existe un turno con ese Id");
                }
            }

            if (string.IsNullOrEmpty(consulta.MotivoConsulta))
            {
                return BadRequest("No puede actualizar una consulta con motivo vacio");
            }

            if (string.IsNullOrEmpty(consulta.Diagnostico))
            {
                return BadRequest("No puede actualizar una consulta con diagnostico vacio");
            }

            if (string.IsNullOrEmpty(consulta.Tratamiento))
            {
                return BadRequest("No puede actualizar una consulta con tratamiento vacio");
            }

            if (string.IsNullOrEmpty(consulta.Observaciones))
            {
                return BadRequest("No puede actualizar una consulta con observaciones vacias");
            }

            consulta.MotivoConsulta = consulta.MotivoConsulta.ToUpper();
            consulta.Diagnostico = consulta.Diagnostico.ToUpper();
            consulta.Tratamiento = consulta.Tratamiento.ToUpper();
            consulta.Observaciones = consulta.Observaciones.ToUpper();

            context.Update(consulta);
            await context.SaveChangesAsync();

            return Ok("Se ha actualizado una consulta");
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id)
        {
            var existe = await context.Consultas
                .FirstOrDefaultAsync(x => x.Id == id);

            if (existe == null)
            {
                return NotFound("No se encontro una consulta con ese Id");
            }

            existe.Visible = false;
            await context.SaveChangesAsync();

            return Ok("Se ha borrado una consulta");
        }
    }
}