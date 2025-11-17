using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Events
{
    public class Event : Domain
    {
        public required EventType Type { get; set; }

        public required Subject Subject { get; set; }

        public required DateTime StartTime { get; set; }

        public required DateTime EndTime { get; set; }

        /// <summary>
        /// Преподавателей на событии может быть больше, но полномочия отмечать есть только у одного
        /// </summary>
        public required Guid InstructorId { get; set; }
    }
}
