using ProyectoClinica.Shared.Entidades.AOJEDA;
using ProyectoClinica.Shared.Entidades.EROMAN;
using ProyectoClinica.Shared.Entidades.JBRITEZ;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.EROMAN.ConsultaDTOs
{
    public class ConsultaGetDTO
    {
        public int Id { get; set; }
   
        public DateTime FechaConsulta { get; set; }

        public string MotivoConsulta { get; set; }

        public string Diagnostico { get; set; }

        public string Tratamiento { get; set; }

        public string Observaciones { get; set; }

        public DateTime FechaRegistro { get; set; }  

        public static ConsultaGetDTO EntityToDTO (Consulta entity)
        {
            return new ConsultaGetDTO
            {
                Id = entity.Id,
                FechaConsulta = entity.FechaConsulta,
                MotivoConsulta = entity.MotivoConsulta.ToUpper(),
                Diagnostico = entity.Diagnostico.ToUpper(),
                Tratamiento = entity.Tratamiento.ToUpper(),
                Observaciones = entity.Observaciones.ToUpper(),
                FechaRegistro = entity.FechaRegistro
            };
        }

    }
}
