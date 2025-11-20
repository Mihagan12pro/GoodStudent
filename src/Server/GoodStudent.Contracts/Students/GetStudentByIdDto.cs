using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Students
{
    public record GetStudentByIdDto(string Name, string Surname, string? Patronymic, string? GroupNumber);
}
