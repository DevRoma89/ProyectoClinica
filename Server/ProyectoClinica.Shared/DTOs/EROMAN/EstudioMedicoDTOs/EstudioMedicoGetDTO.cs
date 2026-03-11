using ProyectoClinica.Shared.Entidades.EROMAN;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.EROMAN.EstudioMedicoDTOs
{
    public class EstudioMedicoGetDTO
    {

        public int Id { get; set; } 
        public int ConsultaId { get; set; }  
        public string TipoEstudio { get; set; } 
        public string Resultado { get; set; } 
        public string ArchivoAdjuntoURL { get; set; } 
        public DateTime FechaEstudio { get; set; }

        public static EstudioMedicoGetDTO EntityToDTO(EstudioMedico entity)
        {
            return new EstudioMedicoGetDTO
            {
                Id = entity.Id,
                ConsultaId = entity.ConsultaId,
                TipoEstudio = entity.TipoEstudio,
                Resultado = entity.Resultado,
                ArchivoAdjuntoURL = entity.ArchivoAdjuntoURL,
                FechaEstudio = entity.FechaEstudio

            };
        }


    }
}
