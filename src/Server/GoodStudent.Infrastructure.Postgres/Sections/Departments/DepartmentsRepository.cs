using GoodStudent.Application.Sections.Departments;
using GoodStudent.Domain.Profession;
using GoodStudent.Domain.Sections;

namespace GoodStudent.Infrastracture.Postgres.Sections.Departments
{
    internal class DepartmentsRepository : IDepartmentsRepository
    {
        private readonly SectionsContext _sectionsContext;

        public Task<Guid> AddAsync(Department department, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<Department> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Profession>> GetProfessionsAsync(Guid id, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public DepartmentsRepository(SectionsContext sectionsContext)
        {
            _sectionsContext = sectionsContext;
        }
    }
}
