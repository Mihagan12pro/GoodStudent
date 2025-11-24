using GoodStudent.Domain.Sections;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Sections.Departments
{
    public record NewDepartmentDto(string Tittle, string? Description, Faculty Faculty);
}
