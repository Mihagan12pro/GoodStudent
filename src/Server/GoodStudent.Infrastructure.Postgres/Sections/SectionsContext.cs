using GoodStudent.Infrastracture.Postgres.Sections.Departments;
using GoodStudent.Infrastracture.Postgres.Sections.Faculties;
using GoodStudent.Infrastracture.Postgres.Sections.Professions;
using Microsoft.EntityFrameworkCore;

namespace GoodStudent.Infrastracture.Postgres.Sections
{
    internal class SectionsContext : BaseContext
    {
        public DbSet<DepartmentEntity> Departments { get; set; } = null!;
        public DbSet<FacultyEntity> Faculties { get; set; } = null!;
        public DbSet<ProfessionEntity> Professions { get; set; } = null!;

        public SectionsContext(DbSet<FacultyEntity> faculties)
        {
            Faculties = faculties;
        }

        public SectionsContext()
        {
            databaseName += "goodStudents_sectionsDb";

            Database.EnsureCreated();
        }
    }
}
