using GoodStudent.Domain.Events.Subjects;
using GoodStudent.Infrastracture.Postgres.Events.Subjects;
using GoodStudent.Infrastracture.Postgres.Instructors;
using GoodStudent.Infrastracture.Postgres.Sections.Departments;
using GoodStudent.Infrastracture.Postgres.Sections.Faculties;
using GoodStudent.Infrastracture.Postgres.Sections.Professions;
using GoodStudent.Infrastracture.Postgres.Students.Groups;
using GoodStudent.Infrastracture.Postgres.Students.Students;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres
{
    internal class GoodStudentContext : BaseContext
    {
        public DbSet<DepartmentEntity> Departments { get; set; } = null!;

        public DbSet<FacultyEntity> Faculties { get; set; } = null!;

        public DbSet<ProfessionEntity> Professions { get; set; } = null!;

        public DbSet<StudentEntity> Students { get; set; } = null!;

        public DbSet<GroupEntity> Groups { get; set; } = null!;

        public DbSet<SubjectEntity> Subjects { get; set; } = null!;

        public DbSet<InstructorEntity> Instructors { get; set; } = null!;

        public GoodStudentContext()
        {
            databaseName += "goodStudentDb";

            Database.EnsureCreated();
        }
    }
}
