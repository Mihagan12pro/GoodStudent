using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoodStudent.Infrastracture.Postgres.Migrations.Sections
{
    /// <inheritdoc />
    public partial class AddAdminId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AdminId",
                table: "Departments",
                type: "uuid",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminId",
                table: "Departments");
        }
    }
}
