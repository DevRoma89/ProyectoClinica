using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicoController : ControllerBase
    {
        private readonly AppDbContext context;

        public MedicoController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Medico>>> Get()
        {
            return await context.Medicos.Include(m => m.Especialidad).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Medico>> Get(int id)
        {
            var medico = await context.Medicos.Include(m => m.Especialidad).FirstOrDefaultAsync(m => m.Id == id);
            if (medico == null)
            {
                return NotFound();
            }
            return medico;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Medico medico)
        {
            if (String.IsNullOrEmpty(medico.Nombre))
            {
                return BadRequest("No puede agregar un medico con nombre vacio");
            }
            if (String.IsNullOrEmpty(medico.Apellido))
            {
                return BadRequest("No puede agregar un medico con apellido vacio");
            }
            if (String.IsNullOrEmpty(medico.Matricula))
            {
                return BadRequest("No puede agregar un medico con matricula vacia");
            }

            context.Add(medico);
            await context.SaveChangesAsync();
            return Ok(medico);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] Medico medico)
        {
            if (id != medico.Id)
            {
                return BadRequest("El id del medico no coincide");
            }

            var existe = await context.Medicos.AnyAsync(m => m.Id == id);
            if (!existe)
            {
                return NotFound();
            }

            context.Update(medico);
            await context.SaveChangesAsync();
            return Ok(medico);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var medico = await context.Medicos.FindAsync(id);
            if (medico == null)
            {
                return NotFound();
            }

            context.Remove(medico);
            await context.SaveChangesAsync();
            return Ok();
        }
    }
}
