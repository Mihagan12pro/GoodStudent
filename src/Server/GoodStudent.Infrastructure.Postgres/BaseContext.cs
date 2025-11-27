using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres
{
    public class BaseContext : DbContext
    {
        private const string _connectionString = "Port=3306;Password=1234567890;Username=postgres;Host=localhost;";

        protected string databaseName = "Database=";

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(_connectionString + databaseName);
        }


        //Database=goodStudent_studentsDb
    }
}
