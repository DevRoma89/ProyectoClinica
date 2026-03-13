using ProyectoClinica.Shared.Entidades.AOJEDA;
using ProyectoClinica.Shared.Entidades.JBRITEZ;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.JBRITEZ.TurnoDTOs
{
    public class TurnoPostDTO
    {
        public int MedicoId { get; set; }
        public int PacienteId { get; set; }
        public DateTime Fecha { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFin { get; set; }
        public string Estado { get; set; }
        public string Observaciones { get; set; }

        public static Turno DtoToEntity(TurnoPostDTO dto)
        {

            return new Turno
            {
                MedicoId = dto.MedicoId,
                PacienteId = dto.PacienteId,
                Fecha = dto.Fecha,
                HoraInicio = TimeSpan.Parse(dto.HoraInicio),
                HoraFin = TimeSpan.Parse(dto.HoraFin),
                Estado = dto.Estado.ToUpper(),
                Observaciones = dto.Observaciones.ToUpper()
            };

        }

    }
}