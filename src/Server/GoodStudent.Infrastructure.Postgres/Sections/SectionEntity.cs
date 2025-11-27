using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Sections
{
    internal abstract class SectionEntity : DbEntity
    {
        public required string Tittle { get; set; }
    }
}
