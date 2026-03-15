using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ProyectoClinica.Shared.Entidades.MFLORENTIN;

namespace ProyectoClinica.Shared.DTOs.MFLORENTIN.RecetaDTOs
{
    public class RecetaGetDTO
    {
        public int Id { get; set; }
        public int ConsultaId { get; set; }
        public DateTime FechaEmision { get; set; }
        public string IndicacionesGenerales { get; set; }

        public static RecetaGetDTO EntityToDto(Receta entity)
        {
            return new RecetaGetDTO
            {
                Id = entity.Id,
                ConsultaId = entity.ConsultaId,
                FechaEmision = entity.FechaEmision,
                IndicacionesGenerales = entity.IndicacionesGenerales
            };
        }
    }
}
