using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Students
{
    public record StudentByIdDto(string Name, string Surname, string GroupCode, string? Patronymic = null);
}
