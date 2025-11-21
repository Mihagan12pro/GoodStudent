using GoodStudent.Application.Students;
using GoodStudent.Domain.Students;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using Group = GoodStudent.Domain.Students.Group;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    internal class GroupsEFRepository : IGroupsRepository
    {
        private readonly StudentsContext _studentsContext;

        public async Task<Guid> AddAsync(Group group, CancellationToken cancellationToken)
        {
            GroupEntity groupEntity = new GroupEntity();
            groupEntity.Number = group.Number;
            groupEntity.ProfessionId = group.ProfessionId;

            await _studentsContext.Groups.AddAsync(groupEntity);
            await _studentsContext.SaveChangesAsync();

            return groupEntity.Id;
        }

        public async Task<(Group, IEnumerable<Student>)?> GetStudentsAsync(Guid groupId, CancellationToken cancellationToken)
        {
            GroupEntity? groupEntity = await _studentsContext.Groups.FirstOrDefaultAsync(g => g.Id == groupId);

            if (groupEntity == null)
                return null;

            List<StudentEntity> studentEntities = await _studentsContext.Students.
                Select(s => s).
                    Where(s => s.GroupId == groupId).
                        ToListAsync();

            List<Student> students = new List<Student>();

            foreach (StudentEntity entity in studentEntities)
            {
                Student student = new Student()
                {
                    Name = entity.Name!,

                    Surname = entity.Surname!,

                    Patronymic = entity.Patronymic
                };
            }

            Group group = new Group()
            {
                Number = groupEntity.Number!,

                ProfessionId = groupEntity.ProfessionId,

                Id = groupEntity.Id
            };

            return new (group, students);
        }

        public async Task<Group> GetByIdAsync(Guid Id, CancellationToken cancellationToken)
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
