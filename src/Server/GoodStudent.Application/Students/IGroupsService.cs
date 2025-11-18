using GoodStudent.Contracts.Students;
using GoodStudent.Domain.Students;
using Group = GoodStudent.Domain.Students.Group;

namespace GoodStudent.Application.Students
{
    public interface IGroupsService
    {
        Task<Guid> AddAsync(NewGroupDto newGroup);

        Task<GetStudentsByGroup> GetStudentsAsync(Guid groupId);
    }
}
