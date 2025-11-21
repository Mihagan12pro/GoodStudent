using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.People
{
    public abstract class Person : Domain
    {
        public required string Name { get; set; }

        public required string Surname { get; set; }

        public string? Patronymic { get; set; } 
    }
}
