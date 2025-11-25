using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Events.Subjects
{
    public record class NewSubjectDto(string Tittle, string? Description, Guid DepartmentId);
}
