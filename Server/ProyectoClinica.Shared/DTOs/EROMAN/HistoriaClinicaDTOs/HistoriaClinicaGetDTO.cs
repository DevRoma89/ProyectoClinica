using ProyectoClinica.Shared.DTOs.EROMAN.AntecedenteMedicoDTOs;
using ProyectoClinica.Shared.DTOs.EROMAN.ConsultaDTOs;
using ProyectoClinica.Shared.Entidades.AOJEDA;
using ProyectoClinica.Shared.Entidades.EROMAN;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.EROMAN.HistoriaClinicaDTOs
{
    public class HistoriaClinicaGetDTO
    {
        public int Id { get; set; }
        public string Paciente { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.Now;
        public string ObservacionesGenerales { get; set; }
        public List<AntecedenteMedicoGetDTO> AntecedentesMedicos { get; set; }
        public List<ConsultaGetDTO> Consultas { get; set; }

        public static HistoriaClinicaGetDTO EntityToDTO(HistoriaClinica entity)
        {

            return new HistoriaClinicaGetDTO
            {
                Id = entity.Id, 
                Paciente = entity.Paciente.Nombre + " " + entity.Paciente.Apellido,
                FechaCreacion = entity.FechaCreacion,
                ObservacionesGenerales = entity.ObservacionesGenerales,
                AntecedentesMedicos = entity.AntecedentesMedicos.Select(AntecedenteMedicoGetDTO.EntityToDTO).ToList(),
                Consultas = entity.Consultas.Select(ConsultaGetDTO.EntityToDTO).ToList()

            }; 
            
        }

    }
}
