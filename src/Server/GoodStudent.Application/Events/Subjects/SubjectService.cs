using GoodStudent.Application.Sections.Departments;
using GoodStudent.Contracts.Events.Subjects;
using GoodStudent.Domain.Events.Subjects;

namespace GoodStudent.Application.Events.Subjects
{
    internal class SubjectService : ISubjectService
    {
        private readonly ISubjectsRepository _subjectRepository;
        private readonly IDepartmentsRepository _departmentsRepository;

        public async Task<Guid> AddNew(NewSubjectDto request, CancellationToken cancellationToken)
        {
            var department = await _departmentsRepository.GetByIdAsync(request.DepartmentId, cancellationToken);

            if (department == null)
            {
                throw new NullReferenceException();
            }

            Subject subject = new Subject() { Tittle = request.Tittle, Description = request.Description, DepartmentId = request.DepartmentId };

            Guid id = await _subjectRepository.AddNewAsync(subject, cancellationToken);

            return id;
        }

        public async Task<GetSubjectDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Subject subject = await _subjectRepository.GetByIdAsync(id, cancellationToken);

            if (subject == null)
                throw new NullReferenceException();

            var response = new GetSubjectDto(subject.Tittle, subject.Description);

            return response;
        }

        public async Task<Guid> GetIdByTittle(string tittle, CancellationToken cancellationToken)
        {
            Guid id = await _subjectRepository.GetIdAsync(tittle, cancellationToken);

            if (id == Guid.Empty)
                throw new NullReferenceException();

            return id;
        }

        public SubjectService(ISubjectsRepository subjectsRepository, IDepartmentsRepository departmentsRepository)
        {
            _subjectRepository = subjectsRepository;
            _departmentsRepository = departmentsRepository;
        }
    }
}
