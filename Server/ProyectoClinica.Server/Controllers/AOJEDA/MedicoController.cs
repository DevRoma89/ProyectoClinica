using Microsoft.AspNetCore.HttpLogging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.DTOs.AOJEDA.MedicoDTOs;
using ProyectoClinica.Shared.DTOs.AOJEDA.EspecialidadDTOs;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server.Controllers.AOJEDA
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
        public async Task<ActionResult<List<MedicoGetDTO>>> Get()
        {
            return await context.Medicos
                .Include(x=>x.Especialidad)
                .Where(x=>x.Visible == true)
                .Select(x=> MedicoGetDTO.EntityToDto(x))
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MedicoPostDTO medico)
        {
            if (string.IsNullOrEmpty(medico.Nombre))
            {
                return BadRequest("No puede agregar un medico con nombre vacio");
            }
            if (string.IsNullOrEmpty(medico.Apellido))
            {
                return BadRequest("No puede agregar un medico con apellido vacio");
            }

            var existeEspecialidad = await context.Especialidades.AnyAsync(x => x.Id == medico.EspecialidadId && x.Visible == true);

            if (!existeEspecialidad)
            {
                return NotFound("No se encontro una especialidad con es Id ");
            }

            var existeMatricula = await context.Medicos.AnyAsync(x => x.Matricula == medico.Matricula);

            if (existeMatricula)
            {
                return BadRequest("Ya existe un medico con esa matricula");
            }

            var existeEmail = await context.Medicos.AnyAsync(x => x.Email == medico.Email);

            if (existeEmail)
            {
                return BadRequest("Ya existe un medico con ese email");
            }

            var entity = MedicoPostDTO.DtoToEntity(medico);

            context.Medicos.Add(entity);

            await context.SaveChangesAsync();

            return Ok("Se ha registrado un nuevo medico");
        }

        [HttpPut]
        public async Task<ActionResult> Put([FromBody] MedicoPutDTO medico)
        {

            var existeMedico = await context.Medicos.FindAsync(medico.Id);

            if (existeMedico == null)
            {
                return NotFound("No se encontro un medico con ese Id ");
            }

            var entity = MedicoPutDTO.DtoToEntity(medico,existeMedico); 

            await context.SaveChangesAsync();

            return Ok("Se ha actualizado un medico");
        }
         
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete([FromRoute] int id)
        {
            var existe = await context.Medicos.FirstOrDefaultAsync(x => x.Id == id);

            if (existe == null)
            {
                return NotFound("No se encontro un medico con ese Id");
            }

            existe.Visible = false;
            await context.SaveChangesAsync();

            return Ok("Se ha borrado un medico");
        }

    }
}
