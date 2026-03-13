using ProyectoClinica.Shared.Entidades.AOJEDA;
using ProyectoClinica.Shared.Entidades.JBRITEZ;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.JBRITEZ.TurnoDTOs
{
    public class TurnoGetDTO
    {
        public int Id { get; set; }
        public int MedicoId { get; set; }
        public string Medico { get; set; }
        public int PacienteId { get; set; }
        public string Paciente { get; set; }
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public string Estado { get; set; }
        public string Observaciones { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaCancelacion { get; set; }

        public static TurnoGetDTO EntityToDTO(Turno entity)
        {
            return new TurnoGetDTO
            {
                Id = entity.Id,
                MedicoId = entity.MedicoId,
                Medico = entity.Medico.Nombre + " " + entity.Medico.Apellido,
                PacienteId = entity.PacienteId,
                Paciente = entity.Paciente.Nombre + " " + entity.Paciente.Apellido,
                Fecha = entity.Fecha,
                HoraInicio = entity.HoraInicio,
                HoraFin = entity.HoraFin,
                Estado = entity.Estado,
                Observaciones = entity.Observaciones,
                FechaCancelacion = entity.FechaCancelacion,
                FechaCreacion = entity.FechaCreacion,

            };
        }
    }
}