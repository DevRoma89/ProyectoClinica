using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.Entidades
{
    public class Consulta
    {
        public int Id { get; set; }

        public int HistoriaClinicaId { get; set; }
        public HistoriaClinica HistoriaClinica { get; set;}


        public int? TurnoId { get; set; }
        public Turno? Turno { get; set; }

        public int MedicoId { get; set; }
        public Medico Medico { get; set; }

        public DateTime FechaConsulta { get; set; }

        public string MotivoConsulta { get; set; }

        public string Diagnostico { get; set; }

        public string Tratamiento { get; set; }

        public string Observaciones { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        public int NumeroSecuencia { get; set; }
    }
}
