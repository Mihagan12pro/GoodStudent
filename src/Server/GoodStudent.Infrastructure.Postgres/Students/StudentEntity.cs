using GoodStudent.Domain.Students.Enums;
using GoodStudent.Infrastracture.Postgres.People;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    [Table("students")]
    internal class StudentEntity : PersonEntity
    {
        //[Column("group_id")]
        //public Guid? GroupId { get; set; }

        //[ForeignKey("group_id")]
        public GroupEntity? Group { get; set; }

        [Column("status")]
        public StudentStatus Student { get; set; } = StudentStatus.Study;
    }
}
