using ProyectoClinica.Shared.DTOs.AOJEDA.MedicoDTOs;
using ProyectoClinica.Shared.Entidades.AOJEDA;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.AOJEDA.PacienteDTOs
{
    public class PacienteGetDTO
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
        public DateTime FechaAlta { get; set; }
        public bool Activo { get; set; } = true;


        public static PacienteGetDTO EntityToDto(Paciente entity)
        {
            return new PacienteGetDTO
            {
                Id = entity.Id,
                Nombre = entity.Nombre,
                Apellido = entity.Apellido,
                Documento = entity.Documento,
                FechaNacimiento = entity.FechaNacimiento,
                Sexo = entity.Sexo,
                Telefono = entity.Telefono,
                Email = entity.Email  ,
                Direccion = entity.Direccion,
                GrupoSanguineo = entity.GrupoSanguineo,
                FechaAlta = entity.FechaAlta,
                Activo = entity.Activo
            };
        }
    }
}
