using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Events
{
    public class EventType : Domain
    {
        public required string Tittle { get; set; }
    }
}
