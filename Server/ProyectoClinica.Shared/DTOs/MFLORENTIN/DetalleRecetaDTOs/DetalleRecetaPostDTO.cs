using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ProyectoClinica.Shared.Entidades.MFLORENTIN;

namespace ProyectoClinica.Shared.DTOs.MFLORENTIN.DetalleRecetaDTOs
{
    public class DetalleRecetaPostDTO
    {
        public string Medicamento { get; set; }
        public string Dosis { get; set; }
        public string Frecuencia { get; set; }
        public string Duracion { get; set; }

        public static DetalleReceta DtoToEntity(DetalleRecetaPostDTO dto, int recetaId)
        {
            return new DetalleReceta
            {
                RecetaId = recetaId,
                Medicamento = dto.Medicamento,
                Dosis = dto.Dosis,
                Frecuencia = dto.Frecuencia,
                Duracion = dto.Duracion
            };
        }
    }
}
