using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Sections.Professions
{
    public record NewProfessionDto(string Tittle, string Code, string? Profile, Guid DepartmentId);
}
