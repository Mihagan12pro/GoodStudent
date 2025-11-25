using GoodStudent.Domain.Sections;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Application.Sections.Departments
{
    public interface IDepartmentsRepository
    {
        Task<Guid> AddAsync(Department department, CancellationToken cancellationToken);

        Task<IEnumerable<Profession>> GetProfessionsAsync(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken);

        Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<bool> UpdateAdminAsync(Guid DepartmentId, Guid InstructorId, CancellationToken cancellationToken);
    }
}
