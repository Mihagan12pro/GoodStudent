namespace GoodStudent.Contracts.Instructors
{
    public record GetInstructorDto(
        string Name,
        string Surname, 
        string? Patronymic,
        Guid? DepartmentId
    );
}
