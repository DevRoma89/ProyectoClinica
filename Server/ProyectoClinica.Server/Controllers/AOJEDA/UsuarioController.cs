using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProyectoClinica.Shared.DTOs.AOJEDA.UsuarioDTOs;
using ProyectoClinica.Shared.Entidades.AOJEDA;
using ProyectoClinica.Shared.Entidades.EROMAN;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography.Xml;
using System.Text;

namespace ProyectoClinica.Server.Controllers.AOJEDA
{
    [ApiController]
    [Route("api/[controller]")] 
    public class UsuarioController:ControllerBase
    {

        private readonly UserManager<Usuario> userManager;
        private readonly IConfiguration configuration;
        private readonly SignInManager<Usuario> signInManager;
        private readonly AppDbContext context;
        public UsuarioController(UserManager<Usuario> userManager, IConfiguration configuration, SignInManager<Usuario> signInManager, AppDbContext context)
        {
            this.userManager = userManager;
            this.configuration = configuration;
            this.signInManager = signInManager;
            this.context = context;
        }

        [HttpGet("Medicos")]
        public async Task<ActionResult> GetAllMedicos()
        {
            var medicos = await context.Users.Select(
                x => new
                    {
                    x.Id,
                    x.UserName,
                    Rol = context.UserClaims
                                 .Where(c=>c.UserId == x.Id )
                                 .Select(c =>                                               
                                                c.ClaimValue  
                                              ).FirstOrDefault(),
                    }
                )
                .Where(x=> x.Rol == "Medico")
                .ToListAsync();   

            return Ok(medicos);
        }
        
        [HttpGet("Pacientes")]
        public async Task<ActionResult> GetAllPacientes()
        {
            var pacientes = await context.Users.Select(
                x => new
                    {
                    x.Id,
                    x.UserName,
                    Rol = context.UserClaims
                                 .Where(c=>c.UserId == x.Id )
                                 .Select(c =>                                               
                                                c.ClaimValue  
                                              ).FirstOrDefault(),
                    }
                )
                .Where(x=> x.Rol == "Paciente")
                .ToListAsync();   

            return Ok(pacientes);
        }

        [HttpPost("Login")]
        [AllowAnonymous]
        public async Task<ActionResult<RespuestaAutenticacionDTO>> Login(
            LoginDTO credencialesUsuarioDTO)
        {
            var usuario = await userManager.FindByEmailAsync(credencialesUsuarioDTO.Email);

            if (usuario is null) {
                return RetornarLoginIncorrecto();
            }

            var resultado = await signInManager.CheckPasswordSignInAsync(usuario, credencialesUsuarioDTO.Password!, lockoutOnFailure: false);

            if (resultado.Succeeded)
            {
                return await ConstruirTokenLogin(credencialesUsuarioDTO);
            }
            else
            {
                return RetornarLoginIncorrecto();
            }
        }


        private async Task<RespuestaAutenticacionDTO> ConstruirTokenLogin(LoginDTO credencialesUsuarioDTO)
        {
            var usuario = await userManager.FindByEmailAsync(credencialesUsuarioDTO.Email);

            var claims = new List<Claim>
            {
                new Claim("Email", credencialesUsuarioDTO.Email),
                new Claim("UserName", usuario.UserName )
            };

            var claimsDB = await userManager.GetClaimsAsync(usuario);

            claims.AddRange(claimsDB);

            var llave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["llavejwt"]!));
            var credenciales = new SigningCredentials(llave, SecurityAlgorithms.HmacSha256);

            var expiracion = DateTime.UtcNow.AddYears(1);

            var tokenDeSeguridad = new JwtSecurityToken(issuer: null, audience: null,
                claims: claims, expires: expiracion, signingCredentials: credenciales);

            var token = new JwtSecurityTokenHandler().WriteToken(tokenDeSeguridad);

            return new RespuestaAutenticacionDTO { Token = token, Expiracion = expiracion };
        }
        private ActionResult RetornarLoginIncorrecto()
        {
            ModelState.AddModelError(string.Empty, "Login Incorrecto");
            return ValidationProblem();
        }

        [HttpPost("Registrar")]
        [AllowAnonymous]
        public async Task<ActionResult<RespuestaAutenticacionDTO>> Registrar(
            CredencialesUsuarioDTO credencialesUsuarioDTO)
        {
            var usuario = new Usuario
            {
                UserName = credencialesUsuarioDTO.UserName,
                Email = credencialesUsuarioDTO.Email

            };

            var resultado = await userManager.CreateAsync(usuario,credencialesUsuarioDTO.Password!);

            if (!resultado.Succeeded)
            {
            
                foreach (var error in resultado.Errors)
                {
                    ModelState.AddModelError(string.Empty, error.Description);
                }

                return ValidationProblem(); 
             
            }

            if (!string.IsNullOrEmpty(credencialesUsuarioDTO.Rol))
            {
                var claims = await userManager.GetClaimsAsync(usuario); 

                if(!claims.Any(x=>x.Type == ClaimTypes.Role && x.Value == credencialesUsuarioDTO.Rol ))
                {
                    await userManager.AddClaimAsync(usuario, new Claim(ClaimTypes.Role, credencialesUsuarioDTO.Rol)); 
                }

            }

            switch (credencialesUsuarioDTO.Rol)
            {
                case "Medico":

                    var especialidad = await context.Especialidades.FirstOrDefaultAsync(x => x.Nombre == "SIN ASIGNAR");
                    
                    if (especialidad == null)
                    {
                        especialidad = new Especialidad(); 
                        especialidad.Nombre = "SIN ASIGNAR";
                        especialidad.Descripcion = "PENDIENTE";
                        context.Especialidades.Add(especialidad);
                        await context.SaveChangesAsync();
                    }

                    context.Medicos.Add(new Medico { EspecialidadId = especialidad.Id, Email = credencialesUsuarioDTO.Email.ToUpper() });
                    await context.SaveChangesAsync();
                    break;
                case "Paciente":

                    var paciente = new Paciente { Email = credencialesUsuarioDTO.Email.ToUpper() }; 
                    context.Pacientes.Add(paciente);
                    await context.SaveChangesAsync();
                    context.HistoriaClinicas.Add(new HistoriaClinica { PacienteId =  paciente.Id});
                    await context.SaveChangesAsync();
                    break;
            }

            var respuestaAutentificacion = await ConstruirToken(credencialesUsuarioDTO);

            return respuestaAutentificacion;
        }

        private async Task<RespuestaAutenticacionDTO> ConstruirToken(CredencialesUsuarioDTO credencialesUsuarioDTO)
        {
            var claims = new List<Claim>
            {
                new Claim("Email", credencialesUsuarioDTO.Email),
                new Claim("UserName", credencialesUsuarioDTO.UserName)
            };

            var usuario = await userManager.FindByEmailAsync(credencialesUsuarioDTO.Email);
            var claimsDB = await userManager.GetClaimsAsync(usuario);

            claims.AddRange(claimsDB);

            var llave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["llavejwt"]!));
            var credenciales = new SigningCredentials(llave, SecurityAlgorithms.HmacSha256);

            var expiracion = DateTime.UtcNow.AddYears(1);

            var tokenDeSeguridad = new JwtSecurityToken(issuer: null, audience: null,
                claims: claims, expires: expiracion, signingCredentials: credenciales);

            var token = new JwtSecurityTokenHandler().WriteToken(tokenDeSeguridad);

            return new RespuestaAutenticacionDTO { Token = token, Expiracion = expiracion };
        }

    }
}
