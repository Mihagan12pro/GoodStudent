using GoodStudent.Application;
using System.Data;

namespace GoodStudent.Infrastracture.Postgres
{
    internal class SqlConnectionFactory : ISqlConnectionFactory
    {
        public IDbConnection CreateConnection()
        {
            throw new NotImplementedException();
        }
    }
}
