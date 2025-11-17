using GoodStudent.Domain.People;
using GoodStudent.Domain.Students.Enums;

namespace GoodStudent.Domain.Students
{
    public class Student : Person
    {
        private EducationType _educationType;
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

        public StudentStatus Status { get; set; } = StudentStatus.Study;

        public int StartYear { get; set; } = DateTime.Now.Year;
        public int EndYear { get; set; }
    }
}
