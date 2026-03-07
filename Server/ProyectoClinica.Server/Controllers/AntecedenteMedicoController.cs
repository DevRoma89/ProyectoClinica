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
            return await context.AntecedenteMedicos
                .Where(x => x.Visible == true)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] AntecedenteMedico antecedente)
        {
            var existeHistoria = await context.HistoriaClinicas
                .AnyAsync(x => x.Id == antecedente.HistoriaClinicaId);

            if (!existeHistoria)
            {
                return BadRequest("No existe una historia clinica con ese Id");
            }

            if (String.IsNullOrEmpty(antecedente.Tipo))
            {
                return BadRequest("No puede agregar un antecedente con tipo vacio");
            }

            if (String.IsNullOrEmpty(antecedente.Descripcion))
            {
                return BadRequest("No puede agregar un antecedente con descripcion vacia");
            }

            antecedente.Tipo = antecedente.Tipo.ToUpper();
            antecedente.Descripcion = antecedente.Descripcion.ToUpper();
            antecedente.Visible = true;

            context.Add(antecedente);
            await context.SaveChangesAsync();

            return Ok("Se ha creado un antecedente medico");
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] AntecedenteMedico antecedente)
        {
            var existe = await context.AntecedenteMedicos
                .AnyAsync(x => x.Id == antecedente.Id);

            if (!existe)
            {
                return NotFound("No se encontro un antecedente medico con ese Id");
            }

            if (String.IsNullOrEmpty(antecedente.Tipo))
            {
                return BadRequest("No puede actualizar un antecedente con tipo vacio");
            }

            if (String.IsNullOrEmpty(antecedente.Descripcion))
            {
                return BadRequest("No puede actualizar un antecedente con descripcion vacia");
            }

            antecedente.Tipo = antecedente.Tipo.ToUpper();
            antecedente.Descripcion = antecedente.Descripcion.ToUpper();

            context.Update(antecedente);
            await context.SaveChangesAsync();

            return Ok("Se ha actualizado un antecedente medico");
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id)
        {
            var existe = await context.AntecedenteMedicos
                .FirstOrDefaultAsync(x => x.Id == id);

            if (existe == null)
            {
                return NotFound("No se encontro un antecedente medico con ese Id");
            }

            existe.Visible = false;
            await context.SaveChangesAsync();

            return Ok("Se ha borrado el antecedente medico");
        }
    }
}