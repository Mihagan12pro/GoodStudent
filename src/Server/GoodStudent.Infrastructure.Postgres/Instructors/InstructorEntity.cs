using GoodStudent.Infrastracture.Postgres.People;

namespace GoodStudent.Infrastracture.Postgres.Instructors
{
    internal class InstructorEntity : PersonEntity
    {
        public Guid? DepartmentId { get; set; }
    }
}
