using GoodStudent.Domain.Students.Enums;
using GoodStudent.Infrastracture.Postgres.People;
using System.ComponentModel.DataAnnotations.Schema;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    [Table("students")]
    internal class StudentEntity : PersonEntity
    {
        public Guid? GroupId { get; set; }

        [ForeignKey(nameof(GroupId))]
        public GroupEntity? Group { get; set; }

        [Column("status")]
        public StudentStatus Student { get; set; } = StudentStatus.Study;
    }
}
