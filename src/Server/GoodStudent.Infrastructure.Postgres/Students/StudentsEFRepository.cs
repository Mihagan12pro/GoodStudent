using GoodStudent.Application.Students;
using GoodStudent.Contracts.Students;
using GoodStudent.Domain.Students;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    internal class StudentsEFRepository : IStudentsRepository
    {
        private readonly StudentsContext _studentsContext;

        public async Task<Guid> AddAsync(Student student, CancellationToken cancellationToken)
        {
            StudentEntity studentEntity = new StudentEntity();
            studentEntity.Name = student.Name;
            studentEntity.SurName = student.Surname;
            studentEntity.Patronymic = student.Patronymic;

            if (student.Group != null)
                studentEntity.GroupId = student.Group.Id;

            await _studentsContext.Students.AddAsync(studentEntity);
            await _studentsContext.SaveChangesAsync();

            return studentEntity.Id;
        }

        public async Task<GetStudentByIdDto> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            Console.WriteLine(id);

            var student = await (from s in _studentsContext.Students where s.Id == id select s).FirstOrDefaultAsync();


            //string? name = student.Name;
            Console.WriteLine(student);
            //return new GetStudentByIdDto(student.Name, student.SurName, student.Patronymic, student.gr);

            throw new NotImplementedException();
        }

        public Task<Group> GetGroupByStudentAsync(Guid studentId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public StudentsEFRepository(StudentsContext studentsContext)
        {
            _studentsContext = studentsContext;
        }
    }
}
