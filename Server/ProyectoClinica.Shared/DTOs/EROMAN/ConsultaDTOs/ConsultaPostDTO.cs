using ProyectoClinica.Shared.Entidades.AOJEDA;
using ProyectoClinica.Shared.Entidades.EROMAN;
using ProyectoClinica.Shared.Entidades.JBRITEZ;
using ProyectoClinica.Shared.Entidades.MFLORENTIN;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.EROMAN.ConsultaDTOs
{
    public class ConsultaPostDTO
    {
        public int HistoriaClinicaId { get; set; }
        public int? TurnoId { get; set; }
        public int MedicoId { get; set; }
        public DateTime FechaConsulta { get; set; }
        public string MotivoConsulta { get; set; }
        public string Diagnostico { get; set; }
        public string Tratamiento { get; set; }
        public string Observaciones { get; set; }
        public int NumeroSecuencia { get; set; }

        public static Consulta DtoToEntity(ConsultaPostDTO dto)
        {
            return new Consulta
            {
                HistoriaClinicaId = dto.HistoriaClinicaId,
                TurnoId = dto.TurnoId,
                MedicoId = dto.MedicoId,
                FechaConsulta = dto.FechaConsulta,
                MotivoConsulta = dto.MotivoConsulta,
                Diagnostico = dto.Diagnostico,
                Tratamiento = dto.Tratamiento,
                Observaciones = dto.Observaciones,
                NumeroSecuencia = dto.NumeroSecuencia,
            };
        }

    }
}
