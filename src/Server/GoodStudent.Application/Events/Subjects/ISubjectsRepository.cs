using GoodStudent.Domain.Events.Subjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Events.Subjects
{
    public interface ISubjectsRepository
    {
        Task<Guid> AddNewAsync(Subject subject, CancellationToken cancellationToken);

        Task<Subject> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken);
    }
}
