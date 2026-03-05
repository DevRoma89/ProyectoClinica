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


    }
}
