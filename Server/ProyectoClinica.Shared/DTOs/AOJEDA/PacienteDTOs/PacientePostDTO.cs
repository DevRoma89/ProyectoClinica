using ProyectoClinica.Shared.DTOs.AOJEDA.MedicoDTOs;
using ProyectoClinica.Shared.Entidades.AOJEDA;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.AOJEDA.PacienteDTOs
{
    public class PacientePostDTO
    { 

        public string UsuarioId { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Documento { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Sexo { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public string Direccion { get; set; }
        public string GrupoSanguineo { get; set; }
        public DateTime FechaAlta { get; set; } = DateTime.Now;
      

        public static Paciente DtoToEntity(PacientePostDTO dto)
        {

            return new Paciente
            {
                UsuarioId = dto.UsuarioId,
                Nombre = dto.Nombre.ToUpper(),
                Apellido = dto.Apellido.ToUpper(),
                Documento = dto.Documento.ToUpper(),
                FechaNacimiento = dto.FechaNacimiento,
                Sexo = dto.Sexo,
                Telefono = dto.Telefono,
                Email = dto.Email.ToUpper(),
                Direccion = dto.Direccion.ToUpper(),
                GrupoSanguineo = dto.GrupoSanguineo.ToUpper(),
                FechaAlta = dto.FechaAlta,  
            };

        }
    }
}
