using System.Diagnostics.Metrics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades.EROMAN;

namespace ProyectoClinica.Server.Controllers.EROMAN
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoriaClinicaController : ControllerBase
    {
        private readonly AppDbContext context;

        public HistoriaClinicaController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<HistoriaClinica>>> Get()
        {
            return await context.HistoriaClinicas
                .Where(x => x.Visible == true)
                .ToListAsync();
        }
        [HttpPost]
        public async Task<ActionResult> Post([FromBody] HistoriaClinica historiaClinica)
        {
            var existePaciente = await context.Pacientes.AnyAsync(x => x.Id == historiaClinica.PacienteId);

            if (!existePaciente)
            {
                return BadRequest("No existe un paciente con ese Id");
            }

            var existeHistoria = await context.HistoriaClinicas.AnyAsync(x => x.PacienteId == historiaClinica.PacienteId && x.Visible == true);

            if (existeHistoria)
            {
                return BadRequest("Ese paciente ya tiene una historia clinica");
            }

            if (string.IsNullOrEmpty(historiaClinica.ObservacionesGenerales))
            {
                return BadRequest("No puede agregar una historia clinica con observaciones vacias");
            }

            historiaClinica.ObservacionesGenerales = historiaClinica.ObservacionesGenerales.ToUpper();
            historiaClinica.Visible = true;

            context.Add(historiaClinica);
            await context.SaveChangesAsync();

            return Ok("Se ha creado una historia clinica");
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] HistoriaClinica historiaClinica)
        {
            var existe = await context.HistoriaClinicas.AnyAsync(x => x.Id == historiaClinica.Id);

            if (!existe)
            {
                return NotFound("No se encontro una historia clinica con ese Id");
            }

            if (string.IsNullOrEmpty(historiaClinica.ObservacionesGenerales))
            {
                return BadRequest("No puede actualizar una historia clinica con observaciones vacias");
            }

            historiaClinica.ObservacionesGenerales = historiaClinica.ObservacionesGenerales.ToUpper();

            context.Update(historiaClinica);
            await context.SaveChangesAsync();

            return Ok("Se ha actualizado una historia clinica");
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id)
        {
            var existe = await context.HistoriaClinicas.FirstOrDefaultAsync(x => x.Id == id);

            if (existe == null)
            {
                return NotFound("No se encontro una historia clinica con ese Id");
            }

            existe.Visible = false;
            await context.SaveChangesAsync();

            return Ok("Se ha borrado una historia clinica");
        }
    }
    
}