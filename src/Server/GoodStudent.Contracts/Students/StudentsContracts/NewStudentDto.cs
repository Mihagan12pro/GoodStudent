using GoodStudent.Domain.Students;
using GoodStudent.Domain.Students.Enums;


namespace GoodStudent.Contracts.Students.StudentsContracts
{
    public record NewStudentDto(
        string Name, 
        string Surname,
        int StartYear,
        string? Patronymic = null,
        Group? Group = null,
        StudentStatus Status = StudentStatus.Study);
}
