using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Students
{
    public class StudentGroup : Domain
    {
        public List<Student> Students { get; } = new List<Student>();
    }
}
