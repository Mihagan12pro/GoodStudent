using GoodStudent.Domain.Students;
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
        [Column("group_id")]
        public Guid GroupId { get; set; }

        public StudentEntity(Student student) : base(student)
        {
            Name = student.Name;

            SurName = student.Surname;

            Patronymic = student.Patronymic;

            if (student.Group != null)
                GroupId = student.Group.Id;
        }

        public StudentEntity()
        {
            
        }
    }
}
