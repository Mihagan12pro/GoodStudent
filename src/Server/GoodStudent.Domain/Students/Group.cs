using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Students
{
    public class Group : Domain
    {
        public required string Code { get; set; }

        public List<Student> Students { get; } = new List<Student>();

        public required Guid FacultyId { get; set; }
    }
}
