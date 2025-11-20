using GoodStudent.Contracts.Students.GroupsContracts;
using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Students
{
    internal class GroupsService : IGroupsService
    {
        private readonly IGroupsRepository _groupsRepository;

        public async Task<Guid> AddAsync(NewGroupDto newGroup)
        {
            Group group = new Group() { Number = newGroup.Number, ProfessionId = newGroup.ProfessionId };

            await _groupsRepository.AddAsync(group);

            Guid id = Guid.NewGuid();

            return id;
        }

        public async Task<GetStudentsByGroupDto> GetStudentsAsync(Guid groupId)
        {
            throw new NotImplementedException();
        }

        public GroupsService(IGroupsRepository groupsRepository)
        {
            _groupsRepository = groupsRepository;
        }
    }
}
