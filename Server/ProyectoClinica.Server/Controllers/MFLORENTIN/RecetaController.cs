using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.DTOs.MFLORENTIN.RecetaDTOs;
using ProyectoClinica.Shared.DTOs.MFLORENTIN.DetalleRecetaDTOs;
using ProyectoClinica.Shared.Entidades;
using ProyectoClinica.Shared.Entidades.MFLORENTIN;

namespace ProyectoClinica.Server.Controllers.MFLORENTIN
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecetaController : ControllerBase
    {
        private readonly AppDbContext context;

        public RecetaController(AppDbContext context)
        {
            this.context = context;
        }

        // PASO 9
        // GET /recetas/consulta/{id}

        [HttpGet("consulta/{id}")]
        public async Task<ActionResult<List<RecetaGetDTO>>> GetPorConsulta(int id)
        {
            return await context.Recetas
                .Where(x => x.ConsultaId == id)
                .Select(x => RecetaGetDTO.EntityToDto(x))
                .ToListAsync();
        }

        // POST /recetas

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] RecetaPostDTO dto)
        {
            var entity = RecetaPostDTO.DtoToEntity(dto);

            context.Recetas.Add(entity);

            await context.SaveChangesAsync();

            return Ok("Receta creada correctamente");
        }

        // PUT /recetas/{id}

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] RecetaPutDTO dto)
        {
            var receta = await context.Recetas.FindAsync(id);

            if (receta == null)
                return NotFound();

            var entity = RecetaPutDTO.DtoToEntity(dto, receta);

            context.Recetas.Update(entity);

            await context.SaveChangesAsync();

            return Ok("Receta actualizada");
        }

        // DELETE /recetas/{id}

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var receta = await context.Recetas.FindAsync(id);

            if (receta == null)
                return NotFound();

            context.Recetas.Remove(receta);

            await context.SaveChangesAsync();

            return Ok("Receta eliminada");
        }

        // PASO 10
        // GET /recetas/{id}/medicamentos

        [HttpGet("{id}/medicamentos")]
        public async Task<ActionResult<List<DetalleRecetaGetDTO>>> GetMedicamentos(int id)
        {
            return await context.DetalleRecetas
                .Where(x => x.RecetaId == id)
                .Select(x => DetalleRecetaGetDTO.EntityToDto(x))
                .ToListAsync();
        }

        // POST /recetas/{id}/medicamentos

        [HttpPost("{id}/medicamentos")]
        public async Task<ActionResult> PostMedicamento(int id, [FromBody] DetalleRecetaPostDTO dto)
        {
            var entity = DetalleRecetaPostDTO.DtoToEntity(dto, id);

            context.DetalleRecetas.Add(entity);

            await context.SaveChangesAsync();

            return Ok("Medicamento agregado a la receta");
        }

        // PUT /recetasdetalle/{id}

        [HttpPut("/api/recetasdetalle/{id}")]
        public async Task<ActionResult> PutDetalle(int id, [FromBody] DetalleRecetaPutDTO dto)
        {
            var detalle = await context.DetalleRecetas.FindAsync(id);

            if (detalle == null)
                return NotFound();

            var entity = DetalleRecetaPutDTO.DtoToEntity(dto, detalle);

            context.DetalleRecetas.Update(entity);

            await context.SaveChangesAsync();

            return Ok("Medicamento actualizado");
        }

        // DELETE /recetasdetalle/{id}

        [HttpDelete("/api/recetasdetalle/{id}")]
        public async Task<ActionResult> DeleteDetalle(int id)
        {
            var detalle = await context.DetalleRecetas.FindAsync(id);

            if (detalle == null)
                return NotFound();

            context.DetalleRecetas.Remove(detalle);

            await context.SaveChangesAsync();

            return Ok("Medicamento eliminado");
        }
    }
}
