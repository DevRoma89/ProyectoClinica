using ProyectoClinica.Shared.Entidades.AOJEDA;
using ProyectoClinica.Shared.Entidades.JBRITEZ;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.JBRITEZ.TurnoDTOs
{
    public class TurnoPutDTO
    {

        public int Id { get; set; }
        public int MedicoId { get; set; }
        public int PacienteId { get; set; }
        public DateTime Fecha { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFin { get; set; }
        public string Estado { get; set; }
        public string Observaciones { get; set; }

        public static Turno DtoToEntity(TurnoPutDTO dto, Turno turnoExistente)
        {
            turnoExistente.MedicoId = dto.MedicoId;
            turnoExistente.PacienteId = dto.PacienteId;
            turnoExistente.Fecha = dto.Fecha;
            turnoExistente.HoraInicio = TimeSpan.Parse(dto.HoraInicio);
            turnoExistente.HoraFin = TimeSpan.Parse(dto.HoraFin);
            turnoExistente.Estado = dto.Estado?.ToUpper() ?? turnoExistente.Estado;
            turnoExistente.Observaciones = dto.Observaciones?.ToUpper() ?? turnoExistente.Observaciones;

            return turnoExistente;
        }

    }
}