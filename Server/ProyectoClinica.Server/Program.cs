using Microsoft.EntityFrameworkCore;
using ProyectoClinica.Server;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));


builder.WebHost.UseUrls("http://0.0.0.0:8080");

var app = builder.Build();


// Aplicar migraciones al iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.

app.UseSwagger();
app.UseSwaggerUI();


app.UseCors( options => 

    options.AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader()
   
    );

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
