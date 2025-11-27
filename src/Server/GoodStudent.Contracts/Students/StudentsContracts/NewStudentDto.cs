using GoodStudent.Domain.Students;
using GoodStudent.Domain.Students.Enums;


namespace GoodStudent.Contracts.Students.StudentsContracts
{
    public record NewStudentDto(
        string Name, 
        string Surname,
        int StartYear,
        string? Patronymic = null,
        Guid? GroupId = null,
        StudentStatus Status = StudentStatus.Study);
}
