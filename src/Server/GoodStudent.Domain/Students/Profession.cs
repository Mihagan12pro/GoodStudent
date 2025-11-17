using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Students
{
    public class Profession : Domain
    {
        public required string Code { get; set; }

        public required string Name { get; set; }

        public string? Profile { get; set; } = null;
    }
}
