using GoodStudent.Domain.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Group = GoodStudent.Domain.Students.Group;

namespace GoodStudent.Application.Students.Groups
{
    public interface IGroupsRepository
    {
        Task<Guid> AddAsync(Group group, CancellationToken cancellationToken);

        Task<Group> GetByIdAsync(Guid Id, CancellationToken cancellationToken);

        Task<(Group, IEnumerable<Student>)?> GetStudentsAsync(Guid groupId, CancellationToken cancellationToken);

        Task<Guid> GetIdByNumberAsync(string number, CancellationToken cancellationToken);
    }
}
