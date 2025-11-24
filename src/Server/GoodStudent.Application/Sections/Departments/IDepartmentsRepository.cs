using GoodStudent.Domain.Profession;
using GoodStudent.Domain.Sections;

namespace GoodStudent.Application.Sections.Departments
{
    public interface IDepartmentsRepository
    {
        Task<Guid> AddAsync(Department department, CancellationToken cancellationToken);

        Task<IEnumerable<Profession>> GetProfessionsAsync(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken);

        Task<Department> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    }
}
