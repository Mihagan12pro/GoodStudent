using GoodStudent.Domain.Students.Enums;

namespace GoodStudent.Contracts.Students
{
    public record NewStudentDto(
        string Name, 
        string Surname,
        int StartYear,
        DateOnly BirthDate, 
        //EducationType EducationType,
        string? Patronymic = null,
        StudentStatus Status = StudentStatus.Study);
}
