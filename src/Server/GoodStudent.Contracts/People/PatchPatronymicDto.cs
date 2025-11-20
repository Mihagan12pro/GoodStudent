using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.People
{
    public record PatchPatronymicDto(Guid Id, string Patronymic);
}
