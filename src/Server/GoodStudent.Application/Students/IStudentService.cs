using GoodStudent.Contracts.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Students
{
    public interface IStudentService
    {
        Task<Guid> AddNew(NewStudentDto newStudentDto, CancellationToken cancellationToken);

        Task<StudentByIdDto> GetById(Guid id);
    }
}
