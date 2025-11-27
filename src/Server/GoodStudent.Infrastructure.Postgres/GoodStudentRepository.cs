using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres
{
    internal abstract class GoodStudentRepository
    {
        protected readonly GoodStudentContext context;

        public GoodStudentRepository(GoodStudentContext context)
        {
            this.context = context;
        }
    }
}
