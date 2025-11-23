using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.UniversityDepartments
{
    public class Department : Domain
    {
        public required Faculty Faculty { get; set; }

        public required string Tittle { get; set; } 

        public string? Description { get; set; }
    }
}
