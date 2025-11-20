using GoodStudent.Contracts.Students;
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

            GetStudentByIdDto response = new GetStudentByIdDto(student.Name, student.Surname, student.Patronymic!, student.Group!.Number);

            return response;
        }

        //public async Task<StudentByIdWithGroupDto> GetByIdWithGroup(Guid id)
        //{
        //    Group group = await _studentsRepository.GetGroupByStudentAsync(id);

        //    Student student = group.Students.Where(s => s.Id == id).First();

        //    return new StudentByIdWithGroupDto(student.Name, student.Surname, group.Code, student.Patronymic);
        //}

        public StudentsService(IStudentsRepository studentsRepository)
        {
             _studentsRepository = studentsRepository;   
        }
    }
}
