using ProyectoClinica.Shared.Entidades.EROMAN;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.EROMAN.EstudioMedicoDTOs
{
    public class EstudioMedicoPostDTO
    { 
        public int ConsultaId { get; set; }  
        public string TipoEstudio { get; set; } 
        public string Resultado { get; set; } 
        public string ArchivoAdjuntoURL { get; set; } 
        public DateTime FechaEstudio { get; set; }

        public static EstudioMedico DtoToEntity(EstudioMedicoPostDTO dto)
        {

            return new EstudioMedico
            {
                ConsultaId = dto.ConsultaId,
                TipoEstudio = dto.TipoEstudio.ToUpper(),
                Resultado = dto.Resultado.ToUpper(),
                ArchivoAdjuntoURL = dto.ArchivoAdjuntoURL,
                FechaEstudio = dto.FechaEstudio
            };

        }

    }
}
