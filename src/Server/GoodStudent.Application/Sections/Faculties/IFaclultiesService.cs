using GoodStudent.Contracts.Sections.Departments;
using GoodStudent.Contracts.Sections.Faculties;
using GoodStudent.Contracts.Students.StudentsContracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Sections.Faculties
{
    public interface IFacultiesService
    {
        Task<Guid> Add(NewFacultyDto request, CancellationToken cancellationToken);

        Task<GetFacultyDto> GetById(Guid id, CancellationToken cancellationToken);

        Task<IEnumerable<GetFacultyDto>> GetAll(CancellationToken cancellationToken);

        Task<Guid> GetId(string tittle, CancellationToken cancellationToken);

        Task<IEnumerable<GetDepartmentDto>> GetDepartments(Guid id, CancellationToken cancellationToken);
    }
}
