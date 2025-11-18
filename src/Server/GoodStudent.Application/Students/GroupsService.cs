using GoodStudent.Contracts.Students;
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
        public Task<Guid> AddAsync(NewGroupDto newGroup)
        {
            throw new NotImplementedException();
        }

        public Task<GetStudentsByGroup> GetStudentsAsync(Guid groupId)
        {
            throw new NotImplementedException();
        }
    }
}
