using GoodStudent.Contracts.Instructors;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Sections.Departments
{
    public record GetDepartmentAdminDto(Guid DepartmentId, GetInstructorDto Instructor);
}