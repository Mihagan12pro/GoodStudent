using GoodStudent.Application.Students;
using GoodStudent.Domain.Students;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    internal class GroupsEFRepository : IGroupsRepository
    {
        public Task<Guid> AddAsync(Group group)
        {
            throw new NotImplementedException();
        }

        public Task<(Group, IEnumerable<Student>)> GetStudentsAsync(Guid groupId)
        {
            throw new NotImplementedException();
        }
    }
}
