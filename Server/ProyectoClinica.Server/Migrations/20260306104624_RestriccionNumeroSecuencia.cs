using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProyectoClinica.Server.Migrations
{
    /// <inheritdoc />
    public partial class RestriccionNumeroSecuencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HistoriaClinicas_PacienteId",
                table: "HistoriaClinicas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_HistoriaClinicaId",
                table: "Consultas");

            migrationBuilder.CreateIndex(
                name: "IX_HistoriaClinicas_PacienteId",
                table: "HistoriaClinicas",
                column: "PacienteId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_HistoriaClinicaId_NumeroSecuencia",
                table: "Consultas",
                columns: new[] { "HistoriaClinicaId", "NumeroSecuencia" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HistoriaClinicas_PacienteId",
                table: "HistoriaClinicas");

            migrationBuilder.DropIndex(
                name: "IX_Consultas_HistoriaClinicaId_NumeroSecuencia",
                table: "Consultas");

            migrationBuilder.CreateIndex(
                name: "IX_HistoriaClinicas_PacienteId",
                table: "HistoriaClinicas",
                column: "PacienteId");

            migrationBuilder.CreateIndex(
                name: "IX_Consultas_HistoriaClinicaId",
                table: "Consultas",
                column: "HistoriaClinicaId");
        }
    }
}
