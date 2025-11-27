using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Students.StudentsContracts
{
    public record GetStudentFullNameDto(string Name, string Surname, string? Patronymic);
}
