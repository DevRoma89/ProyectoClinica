using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ProyectoClinica.Shared.Entidades.AOJEDA;

namespace ProyectoClinica.Shared.DTOs.AOJEDA.EspecialidadDTOs
{

    public class EspecialidadGetDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }
         
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
            return new Especialidad { Descripcion = post.Descripcion.ToUpper(), Nombre = post.Nombre.ToUpper()   }; 
        }

    }

    public class EspecialidadPutDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Descripcion { get; set; }

        public static Especialidad DtoToEntity(EspecialidadPutDTO dto , Especialidad ent)
        {

            ent.Id = dto.Id; 
            ent.Nombre = dto.Nombre.ToUpper();
            ent.Descripcion = dto.Descripcion.ToUpper();

            return ent; 
        }

    }


}
