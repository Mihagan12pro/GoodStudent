using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.People
{
    internal class PersonEntity : Entity
    {
        [Required()]
        public string? Name { get; set; }

        [Required()]
        public string? SurName { get; set; }

        public string? Patronymic { get; set; }

        [Required(), Column("birth_date")]
        public DateOnly BirthDate { get; set; }
    }
}
