using GoodStudent.Contracts.Students.StudentsContracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Students
{
    public interface IStudentsService
    {
        Task<Guid> AddNew(NewStudentDto newStudentDto, CancellationToken cancellationToken);

        Task<GetStudentGroupDto> GetById(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetStudentId(GetStudentsIdDto studentsIdDto, CancellationToken cancellationToken);
    }
}
