using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.Entidades
{
    public class DisponibilidadMedico
    {
       
        public int Id { get; set; }
        public int MedicoId { get; set; }   
        public Medico Medico { get; set; }
        public DayOfWeek DiaSemana { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public int DuracionTurnoMinutos { get; set; }
        public bool Visible { get; set; } = true;

    }
}
