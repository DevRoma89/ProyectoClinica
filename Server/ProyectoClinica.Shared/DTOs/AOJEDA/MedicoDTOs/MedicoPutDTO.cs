using ProyectoClinica.Shared.Entidades.AOJEDA;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.AOJEDA.MedicoDTOs
{
    public class MedicoPutDTO
    { 
        public int Id {get;set;}
        public string UsuarioId {get;set;}
        public string Nombre { get; set; }  
        public string Apellido { get; set; }
        public string Matricula { get; set; }
        public int EspecialidadId { get; set; } 
        public string Telefono { get; set; }
        public string Email { get; set; }
        public bool Activo { get; set; }  

        public static Medico DtoToEntity(MedicoPutDTO dto, Medico medicoExistente)
        {

            medicoExistente.Id = dto.Id;
            medicoExistente.UsuarioId = dto.UsuarioId;
            medicoExistente.Nombre = dto.Nombre;    
            medicoExistente.Apellido = dto.Apellido;
            medicoExistente.Matricula   = dto.Matricula;    
            medicoExistente.EspecialidadId = dto.EspecialidadId;    
            medicoExistente.Telefono = dto.Telefono;    
            medicoExistente.Email = dto.Email;  
            medicoExistente.Activo = dto.Activo;    

            return medicoExistente;
        }

    }
}
