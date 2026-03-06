using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EspecialidadController : ControllerBase
    {

        private readonly AppDbContext context;

        public EspecialidadController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Especialidad>>> Get()
        {
            return await context.Especialidades.Where(x => x.Visible == true).ToListAsync();
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

            especialidad.Nombre = especialidad.Nombre.ToUpper();
            especialidad.Descripcion = especialidad.Descripcion.ToUpper();

            var existeNombre = await context.Especialidades.AnyAsync(x => x.Nombre == especialidad.Nombre);

            if (existeNombre)
            {
                return BadRequest("Ya existe una especialidad con ese nombre");
            }

            var existeDescripcion = await context.Especialidades.AnyAsync(x => x.Descripcion == especialidad.Descripcion);

            if (existeDescripcion)
            {
                return BadRequest("Ya existe una especialidad con esa descripcion");
            }

            context.Add(especialidad);

            await context.SaveChangesAsync();

            return Ok("Se ha creado una especialidad");
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] Especialidad especialidad)
        {

            context.Update(especialidad);
            await context.SaveChangesAsync();

            return Ok("Se ha actualizado una especialidad");
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id )
        {

            var existe = await context.Especialidades.FirstOrDefaultAsync(x=>x.Id == id);

            if (existe == null)
            {
                return NotFound("No se encontro una especialidad con ese Id");
            }

            existe.Visible = false;
            await context.SaveChangesAsync();       

            return Ok("Se ha borrado una especialidad");
        }
    }
}
