using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.DTOs.AOJEDA.EspecialidadDTOs;
using ProyectoClinica.Shared.Entidades.AOJEDA;

namespace ProyectoClinica.Server.Controllers.AOJEDA
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
        public async Task<ActionResult<List<EspecialidadGetDTO>>> Get()
        {


            return await context.Especialidades.Where(x => x.Visible == true).Select(x => EspecialidadGetDTO.EntityToDto(x)).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] EspecialidadPostDTO especialidad)
        {


            if (string.IsNullOrEmpty(especialidad.Nombre))
            {
                return BadRequest("No puede agregar una especialidad con nombre vacio");
            }
            if (string.IsNullOrEmpty(especialidad.Descripcion))
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

            var entity = EspecialidadPostDTO.DtoToEntity(especialidad);

            context.Especialidades.Add(entity);

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
