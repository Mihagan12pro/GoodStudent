using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Instructors
{
    public record UpdateInstructorDto(string? Name, string? Surname, string? Patronymic, Guid? DepartmentId);
}
