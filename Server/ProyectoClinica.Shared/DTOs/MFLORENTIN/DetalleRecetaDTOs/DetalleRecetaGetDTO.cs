using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ProyectoClinica.Shared.Entidades.MFLORENTIN;

namespace ProyectoClinica.Shared.DTOs.MFLORENTIN.DetalleRecetaDTOs
{
    public class DetalleRecetaGetDTO
    {
        public int Id { get; set; }
        public int RecetaId { get; set; }
        public string Medicamento { get; set; }
        public string Dosis { get; set; }
        public string Frecuencia { get; set; }
        public string Duracion { get; set; }

        public static DetalleRecetaGetDTO EntityToDto(DetalleReceta entity)
        {
            return new DetalleRecetaGetDTO
            {
                Id = entity.Id,
                RecetaId = entity.RecetaId,
                Medicamento = entity.Medicamento,
                Dosis = entity.Dosis,
                Frecuencia = entity.Frecuencia,
                Duracion = entity.Duracion
            };
        }
    }
}