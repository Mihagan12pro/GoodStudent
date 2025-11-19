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

                Group = newStudentDto.Group,

                Id = Guid.NewGuid()
            };

            await _studentsRepository.AddAsync(student, cancellationToken);

            return student.Id;
        }

        public async Task<GetStudentByIdDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            GetStudentByIdDto student = await _studentsRepository.GetByIdAsync(id, cancellationToken);

            return student;
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
