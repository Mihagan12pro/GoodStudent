using GoodStudent.Application;
using Npgsql;
using System.Data;
using System.Text.Json;

namespace GoodStudent.Infrastracture.Postgres
{
    internal class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly string _connectionString;

        public IDbConnection CreateConnection()
        {
            var connection = new NpgsqlConnection(_connectionString);

            return connection;
        }

        public SqlConnectionFactory()
        {
            _connectionString = "Port=3306;Password=1234567890;Username=postgres;Host=localhost;Database=goodStudentDb";
        }
    }
}
