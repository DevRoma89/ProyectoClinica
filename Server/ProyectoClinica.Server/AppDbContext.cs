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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Consulta>()
                .HasIndex(c => new { c.HistoriaClinicaId, c.NumeroSecuencia })
                .IsUnique();
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
