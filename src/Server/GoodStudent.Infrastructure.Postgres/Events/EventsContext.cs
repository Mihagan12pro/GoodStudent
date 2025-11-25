using GoodStudent.Infrastracture.Postgres.Events.Subjects;
using Microsoft.EntityFrameworkCore;

namespace GoodStudent.Infrastracture.Postgres.Events
{
    internal class EventsContext : BaseContext
    {
        public DbSet<SubjectEntity> Subjects { get; set; } = null!;

        public EventsContext()
        {
            databaseName += "goodStudents_eventsDb";

            Database.EnsureCreated();
        }
    }
}
