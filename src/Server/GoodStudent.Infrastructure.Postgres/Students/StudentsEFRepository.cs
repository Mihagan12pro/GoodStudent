using GoodStudent.Application.Students;
using GoodStudent.Domain.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    internal class StudentsEFRepository : IStudentsRepository
    {
        public Task<Guid> AddAsync(Student student, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<Group> GetGroupByStudentAsync(Guid studentId)
        {
            throw new NotImplementedException();
        }
    }
}
