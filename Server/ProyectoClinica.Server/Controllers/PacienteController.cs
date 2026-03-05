using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacienteController : ControllerBase
    {
        private readonly AppDbContext context;

        public PacienteController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Paciente>>> Get()
        {
            return await context.Pacientes.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Paciente>> Get(int id)
        {
            var paciente = await context.Pacientes.FindAsync(id);
            if (paciente == null)
            {
                return NotFound();
            }
            return paciente;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Paciente paciente)
        {
            if (String.IsNullOrEmpty(paciente.Nombre))
            {
                return BadRequest("No puede agregar un paciente con nombre vacio");
            }
            if (String.IsNullOrEmpty(paciente.Apellido))
            {
                return BadRequest("No puede agregar un paciente con apellido vacio");
            }
            if (String.IsNullOrEmpty(paciente.Documento))
            {
                return BadRequest("No puede agregar un paciente con documento vacio");
            }

            context.Add(paciente);
            await context.SaveChangesAsync();
            return Ok(paciente);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] Paciente paciente)
        {
            if (id != paciente.Id)
            {
                return BadRequest("El id del paciente no coincide");
            }

            var existe = await context.Pacientes.AnyAsync(p => p.Id == id);
            if (!existe)
            {
                return NotFound();
            }

            context.Update(paciente);
            await context.SaveChangesAsync();
            return Ok(paciente);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var paciente = await context.Pacientes.FindAsync(id);
            if (paciente == null)
            {
                return NotFound();
            }

            context.Remove(paciente);
            await context.SaveChangesAsync();
            return Ok();
        }
    }
}
