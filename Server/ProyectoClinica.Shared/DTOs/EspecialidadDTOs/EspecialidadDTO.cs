using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProyectoClinica.Shared.Entidades;

namespace ProyectoClinica.Shared.DTOs.EspecialidadDTOs
{

    public class EspecialidadGetDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }

        public static List<EspecialidadGetDTO> ListEntityToDto(List<Especialidad> entity)
        {
            return entity.Select( x => new EspecialidadGetDTO
            {
                Descripcion = x.Descripcion,
                Id = x.Id,  
                Nombre = x.Nombre
            }).ToList();
        }

        public static EspecialidadGetDTO EntityToDto(Especialidad entity)
        {
            return new EspecialidadGetDTO { Id = entity.Id, Descripcion = entity.Descripcion, Nombre = entity.Nombre};  
        }

    }   

    public class EspecialidadPostDTO
    {
        public string Nombre { get; set; }
        public string Descripcion { get; set; }

        public static Especialidad DtoToEntity(EspecialidadPostDTO post)
        {
            return new Especialidad { Descripcion = post.Descripcion, Nombre = post.Nombre }; 
        }

    }

 
}
