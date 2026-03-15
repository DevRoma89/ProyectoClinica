using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ProyectoClinica.Shared.Entidades.MFLORENTIN;

namespace ProyectoClinica.Shared.DTOs.MFLORENTIN.RecetaDTOs
{
    public class RecetaPutDTO
    {
        public int Id { get; set; }
        public DateTime FechaEmision { get; set; }
        public string IndicacionesGenerales { get; set; }

        public static Receta DtoToEntity(RecetaPutDTO dto, Receta entity)
        {
            entity.FechaEmision = dto.FechaEmision;
            entity.IndicacionesGenerales = dto.IndicacionesGenerales;

            return entity;
        }
    }
}