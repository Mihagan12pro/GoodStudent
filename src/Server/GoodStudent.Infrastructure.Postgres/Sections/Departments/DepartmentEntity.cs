using GoodStudent.Infrastracture.Postgres.Sections.Faculties;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Sections.Departments
{
    internal class DepartmentEntity : SectionEntity
    {
        [Required()]
        public Guid FacultyId { get; set; }

        [ForeignKey(nameof(FacultyId))]
        public FacultyEntity? Faculty { get; set; }

        public string? Description { get; set; }
    }
}
