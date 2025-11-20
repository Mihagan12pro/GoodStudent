using GoodStudent.Contracts.Students.GroupsContracts;
using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;
using Group = GoodStudent.Domain.Students.Group;

namespace GoodStudent.Application.Students
{
    public interface IGroupsService
    {
        Task<Guid> AddAsync(NewGroupDto newGroup);

        Task<GetStudentsByGroupDto> GetStudentsAsync(Guid groupId);
    }
}
