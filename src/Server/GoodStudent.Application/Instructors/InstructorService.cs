using GoodStudent.Application.Sections.Departments;
using GoodStudent.Contracts.Instructors;
using GoodStudent.Domain.Instructors;
using GoodStudent.Domain.Sections;

namespace GoodStudent.Application.Instructors
{
    internal class InstructorService : IInstructorService
    {
        private readonly IInstructorsRepository _instructorsRepository;
        private readonly IDepartmentsRepository _departmentsRepository;

        public async Task<Guid> AddNew(NewInstructorDto request, CancellationToken cancellationToken)
        {
            Guid? departmentId = request.DepartmentId;
            if (departmentId != null)
            {
                Department? department = await _departmentsRepository.GetByIdAsync((Guid)departmentId, cancellationToken);

                if (department == null)
                    throw new NullReferenceException("Данной кафедры не существует!");
            }

            Instructor instructor = new Instructor()
            {
                Name = request.Name,

                Surname = request.Surname,

                Patronymic = request.Patronymic,

                DepartmentId = request.DepartmentId,

                Status = request.InstructorStatus,

                Position = request.InstructorPosition
            };

            Guid id = await _instructorsRepository.AddNewAsync(instructor, cancellationToken);

            return id;
        }

        public async Task<GetInstructorDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Instructor instructor = await _instructorsRepository.GetByIdAsync(id, cancellationToken);

            if (instructor == null)
                throw new NullReferenceException();

            GetInstructorDto response = new GetInstructorDto(instructor.Name, instructor.Surname, instructor.Patronymic, instructor.DepartmentId);

            return response;
        }

        public async Task<Guid> GetId(GetInstructorDto response, CancellationToken cancellationToken)
        {
            Instructor instructor = new Instructor() { Name = response.Name, Surname = response.Surname, Patronymic = response.Patronymic, DepartmentId = response.DepartmentId };

            Guid id = await _instructorsRepository.GetIdAsync(instructor, cancellationToken);

            if (id ==  Guid.Empty)
                throw new NullReferenceException();

            return id;
        }

        public async Task<GetInstructorDto> UpdateInstructor(Guid id, UpdateInstructorDto request, CancellationToken cancellationToken)
        {
            if (request.DepartmentId != null)
            {
                Department? department = await _departmentsRepository.GetByIdAsync((Guid)request.DepartmentId, cancellationToken);

                if (department == null)
                    throw new NullReferenceException();
            }

            Instructor? instructor = await _instructorsRepository.GetByIdAsync(id, cancellationToken);

            if (instructor == null)
                throw new NullReferenceException();

            instructor.Id = id;
            instructor.Patronymic = request.Patronymic;
            instructor.DepartmentId = request.DepartmentId;

            if (request.Name != null)
            {
                instructor.Name = request.Name;
            }
            if (request.Surname != null)
            {
                instructor.Surname = request.Surname;
            }

            await _instructorsRepository.UpdateInstructorAsync(instructor, cancellationToken);

            var response = new GetInstructorDto(instructor.Name, instructor.Surname, instructor.Patronymic, instructor.DepartmentId);

            return response;
        }

        public InstructorService(IInstructorsRepository instructorsRepository, IDepartmentsRepository departmentsRepository)
        {
            _instructorsRepository = instructorsRepository;
            _departmentsRepository = departmentsRepository;
        }
    }
}
