using System;
using GoodStudent.Domain.Students.Enums;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoodStudent.Infrastracture.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class InitialMifration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<StudentStatus>(
                name: "status",
                table: "students",
                type: "integer",
                nullable: false,
                defaultValue: StudentStatus.Study
            ); 
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "groups");

            migrationBuilder.DropTable(
                name: "students");
        }
    }
}
