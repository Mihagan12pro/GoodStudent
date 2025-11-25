using GoodStudent.Application.Instructors;
using GoodStudent.Application.Sections.Departments;
using GoodStudent.Contracts.Instructors;
using GoodStudent.Domain.Instructors;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Instructors
{
    internal class InstructorRepository : IInstructorsRepository
    {
        private readonly InstructorsContext _instructorsContext;

        public async Task<Guid> AddNewAsync(Instructor instructor, CancellationToken cancellationToken)
        {
            InstructorEntity instructorEntity = new InstructorEntity()
            { Name = instructor.Name, Surname = instructor.Surname, Patronymic = instructor.Patronymic, DepartmentId = instructor.DepartmentId};

            await _instructorsContext.Instructors.AddAsync(instructorEntity, cancellationToken);
            await _instructorsContext.SaveChangesAsync();

            return instructorEntity.Id;
        }

        public async Task<Instructor?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            InstructorEntity? instructorEntity = await _instructorsContext.Instructors.
                FirstOrDefaultAsync(i => i.Id == id);

            if (instructorEntity == null)
                return null;

            Instructor instructor = new Instructor()
            {
                Name = instructorEntity.Name!,
                
                Surname = instructorEntity.Surname!, 
                
                Patronymic = instructorEntity.Patronymic,
                
                DepartmentId = instructorEntity.DepartmentId 
            };

            return instructor;
        }

        public async Task<Guid> GetIdAsync(Instructor instructor, CancellationToken cancellationToken)
        {
            InstructorEntity? instructorEntity = await _instructorsContext.Instructors.FirstOrDefaultAsync(
                    i => 
                        i.Name == instructor.Name 
                        &&
                        i.Surname == instructor.Surname 
                        &&
                        i.Patronymic == instructor.Patronymic
                        && 
                        i.DepartmentId == instructor.DepartmentId
                );

            if (instructorEntity == null)
                return Guid.Empty;

            return instructorEntity.Id;
        }

        public async Task<Instructor> UpdateInstructorAsync(Instructor instructor, CancellationToken cancellationToken)
        {
            InstructorEntity instructorEntity = await _instructorsContext.Instructors.FirstAsync(i => i.Id == instructor.Id);

            instructorEntity.Name = instructor.Name;
            instructorEntity.Surname = instructor.Surname;
            instructorEntity.Patronymic = instructor.Patronymic;
            instructorEntity.DepartmentId = instructor.DepartmentId;

            await _instructorsContext.SaveChangesAsync();

            return instructor;
        }

        public InstructorRepository(InstructorsContext instructorsContext)
        {
            _instructorsContext = instructorsContext;
        }
    }
}
