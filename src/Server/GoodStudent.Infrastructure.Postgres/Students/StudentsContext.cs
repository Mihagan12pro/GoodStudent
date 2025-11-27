using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Primitives;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    internal class StudentsContext : BaseContext
    {
        public DbSet<StudentEntity> Students { get; set; } = null!;

        public DbSet<GroupEntity> Groups { get; set; } = null!;

        public StudentsContext()
        {
            databaseName += "goodStudent_studentsDb";

            Database.EnsureCreated();
        }
    }
}
