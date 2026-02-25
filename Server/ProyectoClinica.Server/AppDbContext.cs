using Microsoft.EntityFrameworkCore;

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


    }
}
