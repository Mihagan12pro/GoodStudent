using GoodStudent.Contracts.Events.Subjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Events.Subjects
{
    public interface ISubjectService
    {
        Task<Guid> AddNew(NewSubjectDto request, CancellationToken cancellationToken);

        Task<GetSubjectDto> GetById(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetIdByTittle(string tittle, CancellationToken cancellationToken);
    }
}
