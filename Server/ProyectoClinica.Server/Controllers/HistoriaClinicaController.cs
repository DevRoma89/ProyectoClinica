using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server.Controllers
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
                .Include(h => h.Paciente)
                .Include(h => h.AntecedentesMedicos)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HistoriaClinica>> Get(int id)
        {
            var historiaClinica = await context.HistoriaClinicas
                .Include(h => h.Paciente)
                .Include(h => h.AntecedentesMedicos)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (historiaClinica == null)
            {
                return NotFound();
            }
            return historiaClinica;
        }

        [HttpGet("paciente/{pacienteId}")]
        public async Task<ActionResult<HistoriaClinica>> GetByPaciente(int pacienteId)
        {
            var historiaClinica = await context.HistoriaClinicas
                .Include(h => h.Paciente)
                .Include(h => h.AntecedentesMedicos)
                .FirstOrDefaultAsync(h => h.PacienteId == pacienteId);

            if (historiaClinica == null)
            {
                return NotFound();
            }
            return historiaClinica;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] HistoriaClinica historiaClinica)
        {
            if (historiaClinica.PacienteId == 0)
            {
                return BadRequest("Debe especificar un paciente para la historia clinica");
            }

            historiaClinica.FechaCreacion = DateTime.Now;
            context.Add(historiaClinica);
            await context.SaveChangesAsync();
            return Ok(historiaClinica);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] HistoriaClinica historiaClinica)
        {
            if (id != historiaClinica.Id)
            {
                return BadRequest("El id de la historia clinica no coincide");
            }

            var existe = await context.HistoriaClinicas.AnyAsync(h => h.Id == id);
            if (!existe)
            {
                return NotFound();
            }

            context.Update(historiaClinica);
            await context.SaveChangesAsync();
            return Ok(historiaClinica);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var historiaClinica = await context.HistoriaClinicas.FindAsync(id);
            if (historiaClinica == null)
            {
                return NotFound();
            }

            context.Remove(historiaClinica);
            await context.SaveChangesAsync();
            return Ok();
        }
    }
}
