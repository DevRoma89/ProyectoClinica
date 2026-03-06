using System;

namespace ProyectoClinica.Shared.Entidades
{
    public class DetalleReceta
    {
        public int Id { get; set; }                   // Clave primaria
        public int RecetaId { get; set; }             // FK hacia Receta
        public Receta Receta { get; set; }            // Relación con Receta

        public int PacienteId { get; set; }           // FK hacia Paciente
        public Paciente Paciente { get; set; }        // Relación con Paciente

        public string CedulaPaciente { get; set; }    // Documento del paciente (opcional)
        public string Instrucciones { get; set; }     // Medicamentos, dosis y horarios
        public DateTime FechaDetalle { get; set; }    // Fecha específica de este detalle
    }
}