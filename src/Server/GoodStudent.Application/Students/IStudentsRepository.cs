using GoodStudent.Contracts.Students;
using GoodStudent.Domain.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Students
{
    public interface IStudentsRepository
    {
        Task<Guid> AddAsync(Student student, CancellationToken cancellationToken);

        Task<GetStudentByIdDto> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<Group> GetGroupByStudentAsync(Guid studentId, CancellationToken cancellationToken);
    }
}
