using GoodStudent.Domain.People;
using GoodStudent.Domain.Students.Enums;
using System.Text.Json.Serialization;

namespace GoodStudent.Domain.Students
{
    public class Student : Person
    {
        private EducationType _educationType;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EducationType EducationType
        {
            get { return _educationType; }
            set
            {
                _educationType = value;

                switch(_educationType)
                {
                    case EducationType.Bachelor:
                        EndYear = StartYear + 4;
                        break;
                    case EducationType.Master:
                        EndYear = StartYear + 2;
                        break;
                    case EducationType.Specialist:
                        EndYear = StartYear + 6;
                        break;
                }
            }
        }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public StudentStatus Status { get; set; } = StudentStatus.Study;

        public int StartYear { get; set; }
        public int EndYear { get; private set; }
    }
}
