using GoodStudent.Infrastracture.Postgres.Sections.Departments;
using System.ComponentModel.DataAnnotations.Schema;

namespace GoodStudent.Infrastracture.Postgres.Sections.Professions
{
    internal class ProfessionEntity : SectionEntity
    {
        public required string Code { get; set; }

        public string? Profile { get; set; }

        public Guid DepartmentId { get; set; }

        [ForeignKey(nameof(DepartmentId))]
        public DepartmentEntity? DepartmentEntity { get; set; }
    }
}
