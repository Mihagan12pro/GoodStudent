using GoodStudent.Application.Sections.Departments;
using GoodStudent.Domain.Instructors;
using GoodStudent.Domain.Sections;
using GoodStudent.Infrastracture.Postgres.Instructors;
using GoodStudent.Infrastracture.Postgres.Sections.Faculties;
using GoodStudent.Infrastracture.Postgres.Sections.Professions;
using Microsoft.EntityFrameworkCore;

namespace GoodStudent.Infrastracture.Postgres.Sections.Departments
{
    internal class DepartmentsRepository : GoodStudentRepository, IDepartmentsRepository
    {
        public DepartmentsRepository(GoodStudentContext context) : base(context)
        {
        }

        public async Task<Guid> AddAsync(Department department, CancellationToken cancellationToken)
        {
            DepartmentEntity departmentEntity = new DepartmentEntity()
            { 
                Tittle = department.Tittle, 

                Description = department.Description, 

                FacultyId = department.FacultyId
            };

            await context.Departments.AddAsync(departmentEntity, cancellationToken);
            await context.SaveChangesAsync();

            Guid id = departmentEntity.Id;

            return id;
        }

        public async Task<Department?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            DepartmentEntity? departmentEntity = await context.Departments.FirstOrDefaultAsync(d => d.Id == id);
            if (departmentEntity == null)
                return null;

            FacultyEntity facultyEntity = await context.Faculties.FirstAsync(f => f.Id == departmentEntity.FacultyId);

            Department department = new Department()
            { 
                FacultyId = facultyEntity.Id,

                Tittle = departmentEntity.Tittle, 

                Description = departmentEntity.Description 
            };

            return department;
        }

        public async Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken)
        {
            DepartmentEntity? departmentEntity = await context.Departments.
                FirstOrDefaultAsync(d => d.Tittle == tittle);

            if (departmentEntity == null)
                return Guid.Empty;

            return departmentEntity.Id;
        }

        public async Task<IEnumerable<Profession>> GetProfessionsAsync(Guid id, CancellationToken cancellationToken)
        {
            IEnumerable<ProfessionEntity> professionEntities = await context.Professions.Select(p => p).
                Where(p => p.DepartmentId == id).
                    ToListAsync();

            if (professionEntities.Count() == 0)
                return null!;

            IEnumerable<Profession> professions = professionEntities.Select(
                p => new Profession()
                {
                    Tittle = p.Tittle,

                    Code = p.Code,

                    Profile = p.Profile,

                    DepartmentId = p.DepartmentId,
                }
            );

            return professions;
        }

        public async Task<bool> UpdateAdminAsync(Guid DepartmentId, Guid InstructorId, CancellationToken cancellationToken)
        {
            DepartmentEntity? departmentEntity = await context.Departments.
                Select(d => d).
                    Where(d => d.Id == DepartmentId).FirstOrDefaultAsync();

            if (departmentEntity == null)
                return false;



            departmentEntity.AdminId = InstructorId;

            await context.SaveChangesAsync();

            return true;
        }
    }
}
