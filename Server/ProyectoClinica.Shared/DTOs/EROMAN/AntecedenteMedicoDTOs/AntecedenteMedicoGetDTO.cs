using ProyectoClinica.Shared.Entidades.EROMAN;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.EROMAN.AntecedenteMedicoDTOs
{
    public class AntecedenteMedicoGetDTO
    {
        public int Id { get; set; }
        public string Tipo { get; set; } 

        public string Descripcion { get; set; }

        public DateTime FechaRegistro { get; set; }   
            
        public static AntecedenteMedicoGetDTO EntityToDTO (AntecedenteMedico entity){

            return new AntecedenteMedicoGetDTO
            {
                Id = entity.Id,
                Tipo = entity.Tipo,
                Descripcion= entity.Descripcion,
                FechaRegistro = entity.FechaRegistro,
            };

        }
    }
}
