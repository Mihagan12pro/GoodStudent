using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Students
{
    public class Group : Domain
    {
        public required string Number { get; set; }

        public required Guid ProfessionId { get; set; }
    }
}
