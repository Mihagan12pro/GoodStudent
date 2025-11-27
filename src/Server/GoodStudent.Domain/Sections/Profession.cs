using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace GoodStudent.Domain.Sections
{
    public class Profession : Domain
    {
        public required string Code { get; set; }

        public required string Tittle { get; set; }

        public string? Profile { get; set; }

        public required Guid DepartmentId { get; set; }

        public Department? Department { get; set; }
    }
}
