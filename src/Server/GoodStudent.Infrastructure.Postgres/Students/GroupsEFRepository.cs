using GoodStudent.Application.Students;
using GoodStudent.Domain.Students;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    internal class GroupsEFRepository : IGroupsRepository
    {
        private readonly StudentsContext _studentsContext;

        public async Task<Guid> AddAsync(Group group)
        {
            GroupEntity groupEntity = new GroupEntity();
            groupEntity.Number = group.Number;
            groupEntity.ProfessionId = group.ProfessionId;
            groupEntity.Id = group.Id;

            await _studentsContext.Groups.AddAsync(groupEntity);
            await _studentsContext.SaveChangesAsync();

            return group.Id;
        }

        public Task<(Group, IEnumerable<Student>)> GetStudentsAsync(Guid groupId)
        {
            throw new NotImplementedException();
        }

        public GroupsEFRepository(StudentsContext studentsContext)
        {
            _studentsContext = studentsContext;
        }
    }
}
