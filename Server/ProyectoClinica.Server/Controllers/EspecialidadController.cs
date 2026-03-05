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

        [HttpPut]
        public async Task<ActionResult> Put()
        {
            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> Delete()
        {
            return Ok();
        }
    }
}
