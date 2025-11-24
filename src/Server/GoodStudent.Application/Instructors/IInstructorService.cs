using GoodStudent.Contracts.Instructors;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Instructors
{
    public interface IInstructorService
    {
        Task<Guid> AddNew(NewInstructorDto request, CancellationToken cancellationToken);

        Task<Guid> GetId(GetInstructorDto response, CancellationToken cancellationToken);

        Task<GetInstructorDto> GetById(Guid id, CancellationToken cancellationToken);
    }
}
