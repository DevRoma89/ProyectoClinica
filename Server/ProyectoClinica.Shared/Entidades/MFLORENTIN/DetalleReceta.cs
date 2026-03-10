using System;

namespace ProyectoClinica.Shared.Entidades.MFLORENTIN
{
    public class DetalleReceta
    {
        public int Id { get; set; }                   // Clave primaria
        public int RecetaId { get; set; }             // FK hacia Receta
        public Receta Receta { get; set; }            // Relación con Receta
 
        public string Medicamento { get; set; }     // Medicamentos, dosis y horarios
        public string Dosis { get; set; }
        public string Frecuencia { get; set; }
        public string Duracion { get; set; }
        
    }
}
