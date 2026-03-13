using ProyectoClinica.Shared.Entidades.AOJEDA;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.AOJEDA.PacienteDTOs
{
    public class PacientePutDTO
    {
        public int Id { get; set; } 
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Documento { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Sexo { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public string Direccion { get; set; }
        public string GrupoSanguineo { get; set; }

        public static Paciente DtoToEntity(PacientePutDTO dto, Paciente ent)
        {
            
            ent.Id = dto.Id;
            ent.Nombre = dto.Nombre;
            ent.Apellido = dto.Apellido;
            ent.Documento = dto.Documento;  
            ent.FechaNacimiento = dto.FechaNacimiento;  
            ent.Sexo = dto.Sexo;    
            ent.Telefono = dto.Telefono;    
            ent.Email = dto.Email;  
            ent.Direccion = dto.Direccion;  
            ent.GrupoSanguineo =   dto.GrupoSanguineo;

            return ent;

        }

    }
}
