using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Events
{
    public class GroupEvent : Domain
    {
        public List<Guid>? Groups { get; set; }
    }
}
