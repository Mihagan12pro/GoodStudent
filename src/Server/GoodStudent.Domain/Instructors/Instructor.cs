using GoodStudent.Domain.Instructors.Enums;
using GoodStudent.Domain.People;

namespace GoodStudent.Domain.Instructors
{
    public class Instructor : Person
    {
        public ScienceDegree? Degree { get; set; }

        public InstructorStatus Status { get; set; } = InstructorStatus.Teaching;
    }
}
