using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.Entidades
{
    public class Receta
    {
        public int Id { get; set; }                   // Clave primaria
        public int MedicoId { get; set; }             // FK hacia Medico
        public Medico Medico { get; set; }            // Relación con Medico
        public DateTime FechaCreacion { get; set; }   // Fecha de creación de la receta
        public string Observaciones { get; set; }     // Notas generales del médico

        // Lista de detalles de la receta
        public List<DetalleReceta> Detalles { get; set; } = new List<DetalleReceta>();
    }
}
