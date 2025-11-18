using GoodStudent.Contracts.Students;
using GoodStudent.Domain.Students;

namespace GoodStudent.Application.Students
{
    public class StudentService : IStudentService
    {
        private readonly IStudentsRepository _studentsRepository;

        public async Task<Guid> AddNew(NewStudentDto newStudentDto, CancellationToken cancellationToken)
        {
            Student student = new Student()
            {
                Name = newStudentDto.Name,

                Surname = newStudentDto.Surname,

                Patronymic = newStudentDto.Patronymic,

                BirthDate = newStudentDto.BirthDate,

                Status = newStudentDto.Status,

                GroupId = newStudentDto.GroupId,

                Id = Guid.NewGuid()
            };

            await _studentsRepository.AddAsync(student, cancellationToken);

            return student.Id;
        }

        //public async Task<StudentByIdWithGroupDto> GetByIdWithGroup(Guid id)
        //{
        //    Group group = await _studentsRepository.GetGroupByStudentAsync(id);

        //    Student student = group.Students.Where(s => s.Id == id).First();

        //    return new StudentByIdWithGroupDto(student.Name, student.Surname, group.Code, student.Patronymic);
        //}

        public StudentService(IStudentsRepository studentsRepository)
        {
             _studentsRepository = studentsRepository;   
        }
    }
}
