using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.UniversityDepartments
{
    public class Faculty : Domain
    {
        public required string Tittle { get; set; } 

        public string? Description { get; set; }
    }
}
