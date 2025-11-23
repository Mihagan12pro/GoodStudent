using GoodStudent.Domain.Sections;
using GoodStudent.Infrastracture.Postgres.Sections.Faculties;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Sections
{
    internal class SectionsContext : BaseContext
    {
        public DbSet<FacultyEntity> Faculties { get; set; } = null!;

        public SectionsContext()
        {
            databaseName += "goodStudents_sectionsDb";

            Database.EnsureCreated();
        }
    }
}
