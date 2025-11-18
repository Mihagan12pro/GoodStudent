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
    internal class StudentsContext : DbContext
    {
        public DbSet<StudentEntity> Students { get; set; } = null!;

        public DbSet<GroupEntity> Groups { get; set; } = null!;

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql("Port=3306;Password=1234567890;Username=postgres;Host=localhost;Database=goodStudent_studentsDb");
        }

        public StudentsContext()
        {
            Database.EnsureCreated();
        }
    }
}
