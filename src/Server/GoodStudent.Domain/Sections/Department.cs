using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Sections
{
    public class Department : Domain
    {
        public Faculty? Faculty { get; set; }

        public required Guid FacultyId { get; set; }

        public required string Tittle { get; set; } 

        public string? Description { get; set; }
    }
}
