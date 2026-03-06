using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.Entidades
{
    public class HistoriaClinica
    {
        public int Id { get; set; } 

        public int PacienteId { get; set; } 
        public Paciente Paciente { get; set; }

        public DateTime FechaCreacion { get; set; }
        public string ObservacionesGenerales { get; set; }

        public List<AntecedenteMedico> AntecedentesMedicos { get; set; }
        public List<Consulta> Consultas { get; set; }
        public bool Visible { get; set; } = true;
    }

}
