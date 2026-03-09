using ProyectoClinica.Shared.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.MedicoDTOs
{
    public class MedicoPostDTO
    { 
        public string Nombre { get; set; }  
        public string Apellido { get; set; }
        public string Matricula { get; set; }
        public int EspecialidadId { get; set; } 
        public string Telefono { get; set; }
        public string Email { get; set; }
        public bool Activo { get; set; } = true; 

        public static Medico DtoToEntity(MedicoPostDTO dto)
        {

            return new Medico
            {
                Nombre = dto.Nombre.ToUpper(),
                Apellido = dto.Apellido.ToUpper(),
                Matricula = dto.Matricula.ToUpper(),
                EspecialidadId = dto.EspecialidadId,
                Telefono = dto.Telefono,
                Email = dto.Email.ToUpper(),
                Activo = dto.Activo,
            }; 
            
        }

    }
}
