using GoodStudent.Domain.Instructors.Enums;
using GoodStudent.Domain.People;
using System.Text.Json.Serialization;

namespace GoodStudent.Domain.Instructors
{
    public class Instructor : Person
    {
        public ScienceDegree? Degree { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public InstructorStatus Status { get; set; } = InstructorStatus.Teaching;
    }
}
