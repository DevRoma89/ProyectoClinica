using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AntecedenteMedicoController : ControllerBase
    {
        private readonly AppDbContext context;

        public AntecedenteMedicoController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<AntecedenteMedico>>> Get()
        {
            return await context.AntecedenteMedicos.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AntecedenteMedico>> Get(int id)
        {
            var antecedente = await context.AntecedenteMedicos.FindAsync(id);
            if (antecedente == null)
            {
                return NotFound();
            }
            return antecedente;
        }

        [HttpGet("historiaclinica/{historiaClinicaId}")]
        public async Task<ActionResult<List<AntecedenteMedico>>> GetByHistoriaClinica(int historiaClinicaId)
        {
            return await context.AntecedenteMedicos
                .Where(a => a.HistoriaClinicaId == historiaClinicaId)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AntecedenteMedico antecedenteMedico)
        {
            if (antecedenteMedico.HistoriaClinicaId == 0)
            {
                return BadRequest("Debe especificar una historia clinica para el antecedente medico");
            }
            if (String.IsNullOrEmpty(antecedenteMedico.Descripcion))
            {
                return BadRequest("No puede agregar un antecedente medico con descripcion vacia");
            }

            antecedenteMedico.FechaRegistro = DateTime.Now;
            context.Add(antecedenteMedico);
            await context.SaveChangesAsync();
            return Ok(antecedenteMedico);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] AntecedenteMedico antecedenteMedico)
        {
            if (id != antecedenteMedico.Id)
            {
                return BadRequest("El id del antecedente medico no coincide");
            }

            var existe = await context.AntecedenteMedicos.AnyAsync(a => a.Id == id);
            if (!existe)
            {
                return NotFound();
            }

            context.Update(antecedenteMedico);
            await context.SaveChangesAsync();
            return Ok(antecedenteMedico);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var antecedente = await context.AntecedenteMedicos.FindAsync(id);
            if (antecedente == null)
            {
                return NotFound();
            }

            context.Remove(antecedente);
            await context.SaveChangesAsync();
            return Ok();
        }
    }
}
