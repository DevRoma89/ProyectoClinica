using Microsoft.AspNetCore.Identity;
using ProyectoClinica.Shared.Entidades.AOJEDA;

namespace ProyectoClinica.Server
{
    public class Usuario:IdentityUser
    {
        public List<Medico> Medicos { get; set; }
        public List<Paciente> Pacientes{ get; set; }
    }
}
