using ProyectoClinica.Shared.Entidades.AOJEDA;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.AOJEDA.MedicoDTOs
{
    public class MedicoGetDTO
    {
        public int Id { get; set; }
        public  string UsuarioId { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Matricula { get; set; }
        public int EspecialidadId { get; set; }
        public string Especialidad { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public bool Activo { get; set; }


        public static MedicoGetDTO EntityToDto(Medico medico)
        {
            return new MedicoGetDTO
            {
                Id = medico.Id,
                UsuarioId = medico.UsuarioId,   
                Nombre = medico.Nombre,
                Apellido = medico.Apellido,
                Matricula = medico.Matricula,
                EspecialidadId = medico.EspecialidadId,
                Especialidad = medico.Especialidad.Nombre,
                Telefono = medico.Telefono,
                Email = medico.Email,
                Activo = medico.Activo
            }; 
        }

    }
}
