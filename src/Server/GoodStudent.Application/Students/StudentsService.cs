using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;

namespace GoodStudent.Application.Students
{
    public class StudentsService : IStudentsService
    {
        private readonly IStudentsRepository _studentsRepository;

        public async Task<Guid> AddNew(NewStudentDto newStudentDto, CancellationToken cancellationToken)
        {
            Student student = new Student()
            {
                Name = newStudentDto.Name,

                Surname = newStudentDto.Surname,

                Patronymic = newStudentDto.Patronymic,

                Status = newStudentDto.Status,

                Group = newStudentDto.Group
            };

            Guid id = await _studentsRepository.AddAsync(student, cancellationToken);

            return id;
        }

        public async Task<GetStudentByIdDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Student student = await _studentsRepository.GetByIdAsync(id, cancellationToken);

            if (student == null)
                throw new NullReferenceException();

            string? number = null;

            if (student.Group != null)
                number = student.Group.Number;  

            GetStudentByIdDto response = new GetStudentByIdDto(student.Name, student.Surname, student.Patronymic, number);

            return response;
        }

        public Task<Guid> GetStudentId(GetStudentsIdDto studentsIdDto, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public StudentsService(IStudentsRepository studentsRepository)
        {
             _studentsRepository = studentsRepository;   
        }
    }
}
