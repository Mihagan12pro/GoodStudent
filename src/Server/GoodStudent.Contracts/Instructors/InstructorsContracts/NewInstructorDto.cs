using GoodStudent.Domain.Instructors.Enums;

namespace GoodStudent.Contracts.Instructors.InstructorsContracts
{
    public record NewInstructorDto(
        string Name,
        string Surname, 
        string? Patronymic,
        Guid? GradeId,
        Guid DepartmentId,
        InstructorStatus InstructorStatus = 0
    );
}
