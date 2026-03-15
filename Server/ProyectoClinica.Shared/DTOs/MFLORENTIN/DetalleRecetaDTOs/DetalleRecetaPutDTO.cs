using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using ProyectoClinica.Shared.Entidades.MFLORENTIN;

namespace ProyectoClinica.Shared.DTOs.MFLORENTIN.DetalleRecetaDTOs
{
    public class DetalleRecetaPutDTO
    {
        public int Id { get; set; }
        public string Medicamento { get; set; }
        public string Dosis { get; set; }
        public string Frecuencia { get; set; }
        public string Duracion { get; set; }

        public static DetalleReceta DtoToEntity(DetalleRecetaPutDTO dto, DetalleReceta entity)
        {
            entity.Medicamento = dto.Medicamento;
            entity.Dosis = dto.Dosis;
            entity.Frecuencia = dto.Frecuencia;
            entity.Duracion = dto.Duracion;

            return entity;
        }
    }
}
