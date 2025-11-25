using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Instructors
{
    internal class InstructorsContext : BaseContext
    {
        public DbSet<InstructorEntity> Instructors { get; set; } = null!;

        public InstructorsContext()
        {
            databaseName += "goodStudent_instructorsDb";

            Database.EnsureCreated();
        }
    }
}
