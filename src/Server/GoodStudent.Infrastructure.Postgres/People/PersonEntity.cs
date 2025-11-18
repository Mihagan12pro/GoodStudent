using GoodStudent.Domain.People;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.People
{
    internal class PersonEntity : DbEntity
    {
        [Required()]
        public string? Name { get; set; }

        [Required()]
        public string? SurName { get; set; }

        public string? Patronymic { get; set; }
    }
}
