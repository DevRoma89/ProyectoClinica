using ProyectoClinica.Shared.Entidades.EROMAN;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.EROMAN.AntecedenteMedicoDTOs
{
    public class AntecedenteMedicoPostDTO
    { 
         
        public int HistoriaClinicaId { get; set; }
         
        public string Tipo { get; set; } // Familiar / Personal / Quirurgico / Alergia

        public string Descripcion { get; set; }

        public static AntecedenteMedico DtoToEntity(AntecedenteMedicoPostDTO dto)
        {
            return new AntecedenteMedico
            {
                HistoriaClinicaId = dto.HistoriaClinicaId,
                Tipo = dto.Tipo.ToUpper(),
                Descripcion = dto.Descripcion.ToUpper()
            };
        }


    }
}
