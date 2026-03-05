using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoClinica.Server.Migrations
{
    /// <inheritdoc />
    public partial class EntidadesAMHC : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HistoriaClinicas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PacienteId = table.Column<int>(type: "int", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ObservacionesGenerales = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoriaClinicas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoriaClinicas_Pacientes_PacienteId",
                        column: x => x.PacienteId,
                        principalTable: "Pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AntecedenteMedicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HistoriaClinicaId = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AntecedenteMedicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AntecedenteMedicos_HistoriaClinicas_HistoriaClinicaId",
                        column: x => x.HistoriaClinicaId,
                        principalTable: "HistoriaClinicas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AntecedenteMedicos_HistoriaClinicaId",
                table: "AntecedenteMedicos",
                column: "HistoriaClinicaId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoriaClinicas_PacienteId",
                table: "HistoriaClinicas",
                column: "PacienteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AntecedenteMedicos");

            migrationBuilder.DropTable(
                name: "HistoriaClinicas");
        }
    }
}
