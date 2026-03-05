using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EspecialidadController:ControllerBase
    {

        private readonly AppDbContext context;

        public EspecialidadController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Especialidad>>> Get()
        {
            return await context.Especialidades.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Especialidad especialidad)
        {

            if (String.IsNullOrEmpty(especialidad.Nombre))
            {
                return BadRequest("No puede agregar una especialidad con nombre vacio");
            }
            if (String.IsNullOrEmpty(especialidad.Descripcion))
            {
                return BadRequest("No puede agregar una especialidad con descripcion vacia");
            }

            context.Add(especialidad);

            await context.SaveChangesAsync();

            return Ok(especialidad);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] Especialidad especialidad)
        {
            if (id != especialidad.Id)
            {
                return BadRequest("El id de la especialidad no coincide");
            }

            if (String.IsNullOrEmpty(especialidad.Nombre))
            {
                return BadRequest("No puede actualizar una especialidad con nombre vacio");
            }
            if (String.IsNullOrEmpty(especialidad.Descripcion))
            {
                return BadRequest("No puede actualizar una especialidad con descripcion vacia");
            }

            var existe = await context.Especialidades.AnyAsync(e => e.Id == id);
            if (!existe)
            {
                return NotFound();
            }

            context.Update(especialidad);
            await context.SaveChangesAsync();
            return Ok(especialidad);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var especialidad = await context.Especialidades.FindAsync(id);
            if (especialidad == null)
            {
                return NotFound();
            }

            context.Remove(especialidad);
            await context.SaveChangesAsync();
            return Ok();
        }
    }
}
