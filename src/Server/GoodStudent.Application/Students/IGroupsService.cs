using GoodStudent.Contracts.Students.GroupsContracts;
using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;
using Group = GoodStudent.Domain.Students.Group;

namespace GoodStudent.Application.Students
{
    public interface IGroupsService
    {
        Task<Guid> Add(NewGroupDto newGroup);

        Task<GetStudentsByGroupDto> GetStudents(Guid groupId);

        Task<GetGroupByIdDto> GetGroupById(Guid Id);
    }
}
