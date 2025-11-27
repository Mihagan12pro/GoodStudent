using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoodStudent.Infrastracture.Postgres.Migrations
{
    /// <inheritdoc />
    public partial class Drop_group_id1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_students_groups_group_id1",
                table: "students");

            migrationBuilder.DropIndex(
                name: "IX_students_group_id1",
                table: "students");

            migrationBuilder.DropColumn(
                name: "group_id1",
                table: "students");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
       name: "group_id1",
       table: "students",
       type: "uuid",
       nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_students_group_id1",
                table: "students",
                column: "group_id1");

            migrationBuilder.AddForeignKey(
                name: "FK_students_groups_group_id1",
                table: "students",
                column: "group_id1",
                principalTable: "groups",
                principalColumn: "Id");
        }
    }
}
