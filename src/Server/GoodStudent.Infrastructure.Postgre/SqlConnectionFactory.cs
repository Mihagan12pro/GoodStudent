using GoodStudent.Application;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
