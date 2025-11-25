using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Events
{
    internal abstract class EventsRepository
    {
        protected readonly EventsContext eventsContext;

        public EventsRepository(EventsContext eventsContext)
        {
            this.eventsContext = eventsContext;
        }
    }
}
