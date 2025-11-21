using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Events
{
    public class AttendanceStatistics : Domain
    {
        public List<(Guid, Event, bool)>? StudentsVisits;
    }
}
