using GoodStudent.Domain.People;
using GoodStudent.Domain.Students.Enums;
using System.Text.Json.Serialization;

namespace GoodStudent.Domain.Students
{
    public class Student : Person
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public StudentStatus Status { get; set; } = StudentStatus.Study;

        public Group? Group { get; set; }

        public Guid? GroupId { get; set; }   
    }
}
