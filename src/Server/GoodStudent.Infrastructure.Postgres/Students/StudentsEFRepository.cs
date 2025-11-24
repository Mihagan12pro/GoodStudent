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
            studentEntity.Surname = student.Surname;
            studentEntity.Patronymic = student.Patronymic;

            if (student.Group != null)
            {
                studentEntity.Group = await _studentsContext.Groups.FirstOrDefaultAsync(g => g.Id == student.Group.Id);

                //studentEntity.Group = new GroupEntity() { Id = student.Group.Id, Number = student.Group.Number, ProfessionId = student.Group.ProfessionId };
            }

            await _studentsContext.Students.AddAsync(studentEntity);
            await _studentsContext.SaveChangesAsync();

            return studentEntity.Id;
        }

        public async Task<Student> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            StudentEntity? studentEntity = await _studentsContext.Students.
                Include(s => s.Group).
                    FirstOrDefaultAsync(s => s.Id == id);/*Students.Where(s => s.Id == id).FirstOrDefaultAsync();*/

            if (studentEntity == null)
                return null!;

            Student student = new Student()
            {
                Name = studentEntity.Name!,

                Surname = studentEntity.Surname!,

                Patronymic = studentEntity.Patronymic,
            };

            Group? group = null;

            if (studentEntity.Group != null)
                group = new Group() { Number = studentEntity.Group.Number, ProfessionId = studentEntity.Group.ProfessionId, Id = studentEntity.Group.Id };

            student.Group = group;

            return student;
        }

        public async Task<Group> GetGroupByStudentAsync(Guid studentId, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public async Task<Guid> GetStudentIdAsync(Student student, Guid? groupId)
        {
            StudentEntity? studentEntity = await _studentsContext.Students.FirstOrDefaultAsync(
                s => s.Name == student.Name 
                && 
                s.Surname == student.Surname
                && 
                s.Patronymic == student.Patronymic
                &&
                s.GroupId == groupId
            );

            if (studentEntity == null)
                return Guid.Empty;

            return studentEntity.Id;
        }

        //public Task<Guid?> GetStudentIdAsync(Student student, Guid? groupId)
        //{
        //    throw new NotImplementedException();
        //}

        public StudentsEFRepository(StudentsContext studentsContext)
        {
            _studentsContext = studentsContext;
        }
    }
}
