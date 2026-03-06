using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.Entidades
{
    public class EstudioMedico
    {
        public int Id { get; set; }

        public int ConsultaId { get; set; }
        public Consulta Consulta { get; set;}

        public string TipoEstudio { get; set; }

        public string Resultado { get; set; }

        public string ArchivoAdjuntoURL { get; set; }

        public DateTime FechaEstudio { get; set; }
        public bool Visible { get; set; } = true;
    }
}
