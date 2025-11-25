using GoodStudent.Contracts.Instructors;
using GoodStudent.Domain.Instructors;

namespace GoodStudent.Application.Instructors
{
    internal class InstructorService : IInstructorService
    {
        private readonly IInstructorsRepository _instructorsRepository;

        public async Task<Guid> AddNew(NewInstructorDto request, CancellationToken cancellationToken)
        {
            Instructor instructor = new Instructor()
            {
                Name = request.Name,

                Surname = request.Surname,

                Patronymic = request.Patronymic,

                DepartmentId = request.DepartmentId,

                Status = request.InstructorStatus,

                Position = request.InstructorPosition,

                IsAdmin = request.IsAdmin
            };

            Guid id = await _instructorsRepository.AddNewAsync(instructor, cancellationToken);

            return id;
        }

        public async Task<GetInstructorDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Instructor instructor = await _instructorsRepository.GetByIdAsync(id, cancellationToken);

            if (instructor == null)
                throw new NullReferenceException();

            //GetInstructorDto response = new GetInstructorDto(instructor.Name, );

            throw new NotImplementedException();
        }

        public async Task<Guid> GetId(GetInstructorDto response, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public InstructorService(IInstructorsRepository instructorsRepository)
        {
            _instructorsRepository = instructorsRepository;
        }
    }
}
