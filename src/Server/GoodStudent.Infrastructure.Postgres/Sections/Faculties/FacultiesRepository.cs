using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Domain.Sections;
using GoodStudent.Infrastracture.Postgres.Sections.Departments;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Sections.Faculties
{
    internal class FacultiesRepository : GoodStudentRepository, IFacultiesRepository
    {
        public FacultiesRepository(GoodStudentContext context) : base(context)
        {
        }

        public async Task<Guid> AddAsync(Faculty faculty, CancellationToken cancellationToken)
        {
            FacultyEntity facultyEntity = new FacultyEntity()
            { 
                Tittle = faculty.Tittle, Description = faculty.Description 
            };

            await context.Faculties.AddAsync(facultyEntity, cancellationToken);
            await context.SaveChangesAsync();

            return facultyEntity.Id;
        }

        public async Task<IEnumerable<Faculty>> GetAdllAsync(CancellationToken cancellationToken)
        {
            List<FacultyEntity> facultyEntities = await context.Faculties.ToListAsync();

            List<Faculty> faculties = new List<Faculty>();

            foreach(var i in facultyEntities)
            {
                Faculty faculty = new Faculty()
                { Tittle = i.Tittle, Description=i.Description };

                faculties.Add(faculty);
            }

            return faculties;
        }

        public async Task<Faculty> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            FacultyEntity? facultyEntity = await context.Faculties.FirstOrDefaultAsync(s => s.Id == id);

            if (facultyEntity == null)
                return null!;

            Faculty faculty = new Faculty()
            { Tittle = facultyEntity.Tittle, Description = facultyEntity.Description };

            return faculty;
        }

        public async Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken)
        {
            FacultyEntity? facultyEntity = await context.Faculties.FirstOrDefaultAsync(s => s.Tittle == tittle);

            if (facultyEntity == null)
                return Guid.Empty;

            return facultyEntity.Id;
        }

        public async Task<IEnumerable<Department>> GetDepartmentsAsync(Guid id, CancellationToken cancellationToken)
        {
            IEnumerable<DepartmentEntity> departmentEntities = await context.Departments.
                Select(s => s).
                    Where(s => s.FacultyId == id).
                        ToListAsync();

            if (departmentEntities.Count() == 0)
                return null!;

            IEnumerable<Department> departments = departmentEntities.Select(d => new Department() { FacultyId = d.FacultyId, Tittle = d.Tittle, Description = d.Description});

            return departments;
        }
    }
}
