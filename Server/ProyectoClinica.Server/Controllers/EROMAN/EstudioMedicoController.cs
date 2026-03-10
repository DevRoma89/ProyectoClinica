using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades.EROMAN;

namespace ProyectoClinica.Server.Controllers.EROMAN
{
    [ApiController]
    [Route("api/[controller]")]
    public class EstudioMedicoController : ControllerBase
    {
        private readonly AppDbContext context;

        public EstudioMedicoController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<EstudioMedico>>> Get()
        {
            return await context.EstudiosMedicos
                .Where(x => x.Visible == true)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] EstudioMedico estudioMedico)
        {
            var existeConsulta = await context.Consultas
                .AnyAsync(x => x.Id == estudioMedico.ConsultaId && x.Visible == true);

            if (!existeConsulta)
            {
                return BadRequest("No existe una consulta con ese Id");
            }

            if (string.IsNullOrEmpty(estudioMedico.TipoEstudio))
            {
                return BadRequest("No puede agregar un estudio medico con tipo vacio");
            }

            if (string.IsNullOrEmpty(estudioMedico.Resultado))
            {
                return BadRequest("No puede agregar un estudio medico con resultado vacio");
            }

            if (string.IsNullOrEmpty(estudioMedico.ArchivoAdjuntoURL))
            {
                return BadRequest("No puede agregar un estudio medico con archivo adjunto vacio");
            }

            estudioMedico.TipoEstudio = estudioMedico.TipoEstudio.ToUpper();
            estudioMedico.Resultado = estudioMedico.Resultado.ToUpper();
            estudioMedico.ArchivoAdjuntoURL = estudioMedico.ArchivoAdjuntoURL.ToUpper();
            estudioMedico.Visible = true;

            context.Add(estudioMedico);
            await context.SaveChangesAsync();

            return Ok("Se ha creado un estudio medico");
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] EstudioMedico estudioMedico)
        {
            var existe = await context.EstudiosMedicos
                .AnyAsync(x => x.Id == estudioMedico.Id);

            if (!existe)
            {
                return NotFound("No se encontro un estudio medico con ese Id");
            }

            var existeConsulta = await context.Consultas
                .AnyAsync(x => x.Id == estudioMedico.ConsultaId && x.Visible == true);

            if (!existeConsulta)
            {
                return BadRequest("No existe una consulta con ese Id");
            }

            if (string.IsNullOrEmpty(estudioMedico.TipoEstudio))
            {
                return BadRequest("No puede actualizar un estudio medico con tipo vacio");
            }

            if (string.IsNullOrEmpty(estudioMedico.Resultado))
            {
                return BadRequest("No puede actualizar un estudio medico con resultado vacio");
            }

            if (string.IsNullOrEmpty(estudioMedico.ArchivoAdjuntoURL))
            {
                return BadRequest("No puede actualizar un estudio medico con archivo adjunto vacio");
            }

            estudioMedico.TipoEstudio = estudioMedico.TipoEstudio.ToUpper();
            estudioMedico.Resultado = estudioMedico.Resultado.ToUpper();
            estudioMedico.ArchivoAdjuntoURL = estudioMedico.ArchivoAdjuntoURL.ToUpper();

            context.Update(estudioMedico);
            await context.SaveChangesAsync();

            return Ok("Se ha actualizado un estudio medico");
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id)
        {
            var existe = await context.EstudiosMedicos
                .FirstOrDefaultAsync(x => x.Id == id);

            if (existe == null)
            {
                return NotFound("No se encontro un estudio medico con ese Id");
            }

            existe.Visible = false;
            await context.SaveChangesAsync();

            return Ok("Se ha borrado un estudio medico");
        }
    }
}