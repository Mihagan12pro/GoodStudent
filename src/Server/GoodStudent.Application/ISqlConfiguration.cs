using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application
{
    public interface ISqlConfiguration
    {
        string Name { get; set; }

        string Password { get; set; }

        string UserName { get; set; }

        string Host { get; set; }

        string Database { get; set; }
    }
}
