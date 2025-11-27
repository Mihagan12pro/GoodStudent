using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Students.Groups
{
    [Table("groups")]
    internal class GroupEntity : DbEntity
    {
        [Required(), Column("number")]
        public string? Number { get; set; }

        [Required(), Column("profession_id")]
        public Guid ProfessionId { get; set; }
    }
}
