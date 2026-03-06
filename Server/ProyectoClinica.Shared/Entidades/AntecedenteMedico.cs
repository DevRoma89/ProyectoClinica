using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.Entidades
{
    public class AntecedenteMedico
    {
        public int Id { get; set; }

        public int HistoriaClinicaId { get; set; }

        public HistoriaClinica HistoriaClinica { get; set; }

        public string Tipo { get; set; } // Familiar / Personal / Quirurgico / Alergia

        public string Descripcion { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.Now;
        public bool Visible { get; set; } = true;
    }
} 
