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
        private readonly StudentsContext _studentsContext;

        public async Task<Guid> AddAsync(Student student, CancellationToken cancellationToken)
        {
            StudentEntity studentEntity = new StudentEntity(student);

            _studentsContext.Add(studentEntity);

            return student.Id;
        }

        public async Task<Group> GetGroupByStudentAsync(Guid studentId)
        {
            throw new NotImplementedException();
        }

        public StudentsEFRepository(StudentsContext studentsContext)
        {
            _studentsContext = studentsContext;
        }
    }
}
