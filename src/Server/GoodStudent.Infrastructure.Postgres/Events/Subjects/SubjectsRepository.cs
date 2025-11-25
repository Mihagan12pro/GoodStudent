using GoodStudent.Application.Events.Subjects;
using GoodStudent.Domain.Events.Subjects;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Events.Subjects
{
    internal class SubjectsRepository : EventsRepository, ISubjectsRepository
    {
        public async Task<Guid> AddNewAsync(Subject subject, CancellationToken cancellationToken)
        {
            SubjectEntity subjectEntity = new SubjectEntity() { Tittle = subject.Tittle, Description =  subject.Description, DepartmentId = subject.DepartmentId };

            await eventsContext.Subjects.AddAsync(subjectEntity);
            await eventsContext.SaveChangesAsync();

            return subjectEntity.Id;
        }

        public async Task<Subject> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            SubjectEntity? subjectEntity = await eventsContext.Subjects.FirstOrDefaultAsync(s => s.Id == id);

            if (subjectEntity == null)
                return null!;

            Subject subject = new Subject() { Tittle = subjectEntity.Tittle, Description = subjectEntity.Description, DepartmentId = subjectEntity.DepartmentId };

            return subject;
        }

        public async Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken)
        {
            Guid id = await eventsContext.Subjects.
                Where(s => s.Tittle == tittle).
                    Select(s => s.Id).
                        FirstOrDefaultAsync();

            return id;
        }

        public SubjectsRepository(EventsContext eventsContext) : base(eventsContext)
        {
        }
    }
}
