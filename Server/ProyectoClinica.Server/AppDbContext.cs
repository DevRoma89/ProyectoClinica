using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Server
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions options) : base(options)
        {
        }

        protected AppDbContext()
        {
        }

        public DbSet<Medico> Medicos { get; set; }
        public DbSet<Especialidad> Especialidades{ get; set; }
        public DbSet<Paciente> Pacientes{ get; set; }
        public DbSet<HistoriaClinica> HistoriaClinicas { get; set;}
        public DbSet<AntecedenteMedico> AntecedenteMedicos { get; set;}

        public DbSet<DisponibilidadMedico> DisponibilidadMedicos { get; set; }
        public DbSet<Turno> Turnos { get; set; }

        public DbSet<Consulta> Consultas { get; set; }
        public DbSet<EstudioMedico> EstudiosMedicos { get; set; }

    }
}
