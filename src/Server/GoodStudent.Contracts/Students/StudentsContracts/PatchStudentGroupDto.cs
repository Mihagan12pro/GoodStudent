using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Students.StudentsContracts
{
    public record PatchStudentGroupDto(Guid StudentId, Guid? GroupId);
}
