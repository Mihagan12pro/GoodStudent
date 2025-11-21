using GoodStudent.Domain.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Group = GoodStudent.Domain.Students.Group;

namespace GoodStudent.Application.Students
{
    public interface IGroupsRepository
    {
        Task<Guid> AddAsync(Group group);

        Task<Group> GetByIdAsync(Guid Id);

        Task<(Group, IEnumerable<Student>)> GetStudentsAsync(Guid groupId);
    }
}
