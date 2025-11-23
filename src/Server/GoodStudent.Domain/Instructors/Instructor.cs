using GoodStudent.Domain.Instructors.Enums;
using GoodStudent.Domain.People;
using GoodStudent.Domain.UniversityDepartments;
using System.Text.Json.Serialization;

namespace GoodStudent.Domain.Instructors
{
    public class Instructor : Person
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public InstructorPosition Position { get; set; } = InstructorPosition.Instructor;


        [JsonConverter(typeof(JsonStringEnumConverter))]
        public InstructorStatus Status { get; set; } = InstructorStatus.Teaching;

        public required Department Department { get; set; }
    }
}
