using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;

namespace GoodStudent.Application.Students
{
    public class StudentsService : IStudentsService
    {
        private readonly IStudentsRepository _studentsRepository;

        public async Task<Guid> AddNew(NewStudentDto request, CancellationToken cancellationToken)
        {
            Student student = new Student()
            {
                Name = request.Name,

                Surname = request.Surname,

                Patronymic = request.Patronymic,

                Status = request.Status,

                GroupId = request.GroupId
            };

            Guid id = await _studentsRepository.AddAsync(student, cancellationToken);

            return id;
        }

        public async Task<GetStudentGroupDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Student student = await _studentsRepository.GetByIdAsync(id, cancellationToken);

            if (student == null)
                throw new NullReferenceException();

            string? number = null;

            if (student.Group != null)
                number = student.Group.Number;  

            GetStudentGroupDto response = new GetStudentGroupDto(student.Name, student.Surname, student.Patronymic, number);

            return response;
        }

        public async Task<Guid> GetStudentId(GetStudentsIdDto studentsIdDto, CancellationToken cancellationToken)
        {
            Student student = new Student()
            {
                Name = studentsIdDto.Name, 
                Surname = studentsIdDto.Surname, 
                Patronymic = studentsIdDto.Patronymic
            };

            Guid id = await _studentsRepository.GetStudentIdAsync(student, studentsIdDto.GroupId);

            if (id == Guid.Empty)
                throw new NullReferenceException();

            return id;
        }

        public StudentsService(IStudentsRepository studentsRepository)
        {
             _studentsRepository = studentsRepository;   
        }
    }
}
