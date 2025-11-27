using GoodStudent.Domain.Events.Subjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace GoodStudent.Domain.Events.Lessons
{
    public class Lesson : Domain
    {
        public required DateTime StartTime { get; set; }

        public required DateTime EndTime { get; set; }

        public required Guid SubjectId { get;set; }

        public required Guid InstructorId { get; set; }

        public Subject? Subject { get;set; }
    }
}
