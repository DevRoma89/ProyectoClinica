using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ProyectoClinica.Shared.Entidades.MFLORENTIN;

namespace ProyectoClinica.Shared.DTOs.MFLORENTIN.RecetaDTOs
{
    public class RecetaPostDTO
    {
        public int ConsultaId { get; set; }
        public DateTime FechaEmision { get; set; }
        public string IndicacionesGenerales { get; set; }

        public static Receta DtoToEntity(RecetaPostDTO dto)
        {
            return new Receta
            {
                ConsultaId = dto.ConsultaId,
                FechaEmision = dto.FechaEmision,
                IndicacionesGenerales = dto.IndicacionesGenerales
            };
        }
    }
}
