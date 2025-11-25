using GoodStudent.Contracts.Instructors;
using GoodStudent.Contracts.Sections.Departments;
using GoodStudent.Contracts.Sections.Professions;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Sections.Departments
{
    public interface IDepartmentsService
    {
        Task<Guid> AddNew(NewDepartmentDto request, CancellationToken cancellationToken);

        Task<IEnumerable<GetProfessionDto>> GetProfessions(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetId(string tittle, CancellationToken cancellationToken);

        Task<GetDepartmentDto> GetById(Guid id, CancellationToken cancellationToken);

        Task<GetInstructorDto> UpdateAdmin(Guid DepartmentId, Guid InstructorId, CancellationToken cancellationToken); 
    }
}
