using GoodStudent.Application.Students;
using GoodStudent.Domain.Students;
using Microsoft.EntityFrameworkCore;

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

        public async Task<(Group, IEnumerable<Student>)> GetStudentsAsync(Guid groupId)
        {
            throw new NotImplementedException();
        }

        public async Task<Group> GetByIdAsync(Guid Id)
        {
            GroupEntity? groupEntity = await _studentsContext.Groups.FirstOrDefaultAsync(g => g.Id == Id);

            if (groupEntity == null)
                return null!;

            Group group = new Group()
            {
                Number = groupEntity.Number!,

                Id = Id,

                ProfessionId = groupEntity.ProfessionId
            };

            return group;
        }

        public GroupsEFRepository(StudentsContext studentsContext)
        {
            _studentsContext = studentsContext;
        }
    }
}
