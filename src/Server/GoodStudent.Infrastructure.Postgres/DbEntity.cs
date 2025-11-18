using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres
{
    internal abstract class DbEntity
    {
        [Key]
        public Guid Id { get; set; }
    }
}
