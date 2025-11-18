using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Students
{
    public record GetStudentsByGroup(string Number, IEnumerable<(string, string, string?)> Students);
}
