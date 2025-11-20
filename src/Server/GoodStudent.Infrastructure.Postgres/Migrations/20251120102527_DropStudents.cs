using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoodStudent.Infrastracture.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class DropStudents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "students");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "students",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    group_id1 = table.Column<Guid>(type: "uuid", nullable: true),
                    group_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "text", nullable: false),
                    patronymic = table.Column<string>(type: "text", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    surname = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_students", x => x.Id);
                    table.ForeignKey(
                        name: "FK_students_groups_group_id1",
                        column: x => x.group_id1,
                        principalTable: "groups",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_students_group_id1",
                table: "students",
                column: "group_id1");
        }
    }
}
