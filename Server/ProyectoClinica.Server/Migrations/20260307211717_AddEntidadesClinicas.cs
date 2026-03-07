using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoClinica.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddEntidadesClinicas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "Turnos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "Pacientes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "Medicos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "HistoriaClinicas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "EstudiosMedicos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "Especialidades",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "DisponibilidadMedicos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "Consultas",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "Visible",
                table: "AntecedenteMedicos",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Visible",
                table: "Turnos");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "Medicos");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "HistoriaClinicas");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "EstudiosMedicos");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "Especialidades");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "DisponibilidadMedicos");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "Consultas");

            migrationBuilder.DropColumn(
                name: "Visible",
                table: "AntecedenteMedicos");
        }
    }
}
