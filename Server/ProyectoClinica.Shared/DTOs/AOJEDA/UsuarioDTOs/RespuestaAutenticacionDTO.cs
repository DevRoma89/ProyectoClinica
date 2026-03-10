using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ProyectoClinica.Shared.DTOs.AOJEDA.UsuarioDTOs
{
    public class RespuestaAutenticacionDTO
    {

        public required string Token { get; set; }
        public DateTime Expiracion { get; set; }

    }
}
