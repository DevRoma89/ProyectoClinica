using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoClinica.Server.Migrations
{
    /// <inheritdoc />
    public partial class TurnosDisponibilidad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "disponibilidadMedicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DiaSemana = table.Column<int>(type: "int", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeSpan>(type: "time", nullable: false),
                    DuracionTurnoMinutos = table.Column<int>(type: "int", nullable: false),
                    MedicoId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_disponibilidadMedicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_disponibilidadMedicos_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GestionTurnos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeSpan>(type: "time", nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Observaciones = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaCancelacion = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MedicoId = table.Column<int>(type: "int", nullable: true),
                    PacienteId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GestionTurnos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GestionTurnos_Medicos_MedicoId",
                        column: x => x.MedicoId,
                        principalTable: "Medicos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_GestionTurnos_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_disponibilidadMedicos_MedicoId",
                table: "disponibilidadMedicos",
                column: "MedicoId");

            migrationBuilder.CreateIndex(
                name: "IX_GestionTurnos_MedicoId",
                table: "GestionTurnos",
                column: "MedicoId");

            migrationBuilder.CreateIndex(
                name: "IX_GestionTurnos_PacienteId",
                table: "GestionTurnos",
                column: "PacienteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "disponibilidadMedicos");

            migrationBuilder.DropTable(
                name: "GestionTurnos");
        }
    }
}
