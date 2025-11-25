using GoodStudent.Domain.Instructors.Enums;

namespace GoodStudent.Contracts.Instructors
{
    public record NewInstructorDto(
        string Name,
        string Surname, 
        string? Patronymic,
        Guid? DepartmentId,
        InstructorStatus InstructorStatus = InstructorStatus.Teaching,
        InstructorPosition InstructorPosition = InstructorPosition.Instructor
    );
}
