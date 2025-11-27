using GoodStudent.Contracts.Students.GroupsContracts;
using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;
using Group = GoodStudent.Domain.Students.Group;

namespace GoodStudent.Application.Students
{
    public interface IGroupsService
    {
        Task<Guid> Add(NewGroupDto newGroup, CancellationToken cancellationToken);

        Task<GetStudentsByGroupDto> GetStudents(Guid groupId, CancellationToken cancellationToken);

        Task<GetGroupByIdDto> GetGroupById(Guid Id, CancellationToken cancellationToken);
    }
}
