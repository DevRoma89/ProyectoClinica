using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.Entidades
{
    public class GestionTurno 
    {
        public int Id { get; set; }


        public DateTime Fecha { get; set; }

     
        public TimeSpan HoraInicio { get; set; }

        public TimeSpan HoraFin { get; set; }

        
        public string Estado { get; set; }

        public string Observaciones { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        public DateTime? FechaCancelacion { get; set; }


        public Medico Medico { get; set; }

        public Paciente Paciente { get; set; }

    }
}
