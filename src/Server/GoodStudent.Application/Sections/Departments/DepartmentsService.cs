using GoodStudent.Contracts.Sections.Departments;
using GoodStudent.Contracts.Sections.Professions;
using GoodStudent.Domain.Sections;

namespace GoodStudent.Application.Sections.Departments
{
    internal class DepartmentsService : IDepartmentsService
    {
        private readonly IDepartmentsRepository _departmentsRepository;

        public async Task<Guid> AddNew(NewDepartmentDto request, CancellationToken cancellationToken)
        {
            Department department = new Department()
            { FacultyId = request.FacultyId, Tittle = request.Tittle, Description = request.Description };

            Guid id = await _departmentsRepository.AddAsync(department, cancellationToken);

            return id;
        }

        public async Task<GetDepartmentDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Department? department = await _departmentsRepository.GetByIdAsync(id, cancellationToken);

            if (department == null)
                throw new NullReferenceException();

            var response = new GetDepartmentDto(department.Tittle, department.Description);

            return response;
        }

        public async Task<Guid> GetId(string tittle, CancellationToken cancellationToken)
        {
            var response = await _departmentsRepository.GetIdAsync(tittle, cancellationToken);

            if (response == Guid.Empty)
                throw new NullReferenceException();

            return response;
        }

        public async Task<IEnumerable<GetProfessionDto>> GetProfessions(Guid id, CancellationToken cancellationToken)
        {
            IEnumerable<Profession> professions = await _departmentsRepository.GetProfessionsAsync(id, cancellationToken);

            if (professions == null)
                throw new NullReferenceException();

            IEnumerable<GetProfessionDto> response = professions.Select(p => new GetProfessionDto(p.Tittle, p.Code, p.Profile));

            return response;
        }

        public async Task<bool> UpdateAdmin(Guid DepartmentId, Guid InstructorId, CancellationToken cancellationToken)
        {
            bool success = await _departmentsRepository.UpdateAdminAsync(DepartmentId, InstructorId, cancellationToken);

            if (!success)
                throw new NullReferenceException();

            return success;
        }

        public DepartmentsService(IDepartmentsRepository departmentsRepository)
        {
            _departmentsRepository = departmentsRepository;
        }
    }
}
