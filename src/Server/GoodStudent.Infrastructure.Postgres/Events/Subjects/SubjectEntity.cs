using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Events.Subjects
{
    internal class SubjectEntity : DbEntity
    {
        public required Guid DepartmentId { get; set; }

        public required string Tittle { get; set; }

        public string? Description { get; set; } 
    }
}
