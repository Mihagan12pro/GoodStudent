using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Events.Subjects
{
    public class Subject : Domain
    {
        public required string Tittle { get; set; }

        public string? Description { get; set; }

        public required Guid DepartmentId { get; set; }
    }
}
