using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Sections.Professions
{
    public record GetProfessionDto(string Tittle, string Code, string? Profile);
}
