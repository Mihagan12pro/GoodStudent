using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Domain.Sections;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres.Sections.Faculties
{
    internal class FacultiesRepository : IFacultiesRepository
    {
        private readonly SectionsContext _sectionsContext;

        public async Task<Guid> AddAsync(Faculty faculty, CancellationToken cancellationToken)
        {
            FacultyEntity facultyEntity = new FacultyEntity()
            { 
                Tittle = faculty.Tittle, Description = faculty.Description 
            };

            await _sectionsContext.Faculties.AddAsync(facultyEntity, cancellationToken);
            await _sectionsContext.SaveChangesAsync();

            return facultyEntity.Id;
        }

        public async Task<IEnumerable<Faculty>> GetAdllAsync(CancellationToken cancellationToken)
        {
            List<FacultyEntity> facultyEntities = await _sectionsContext.Faculties.ToListAsync();

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
            FacultyEntity? facultyEntity = await _sectionsContext.Faculties.FirstOrDefaultAsync(s => s.Id == id);

            if (facultyEntity == null)
                return null!;

            Faculty faculty = new Faculty()
            { Tittle = facultyEntity.Tittle, Description = facultyEntity.Description };

            return faculty;
        }

        public async Task<Guid> GetIdAsync(string tittle, CancellationToken cancellationToken)
        {
            FacultyEntity? facultyEntity = await _sectionsContext.Faculties.FirstOrDefaultAsync(s => s.Tittle == tittle);

            if (facultyEntity == null)
                return Guid.Empty;

            return facultyEntity.Id;
        }

        public FacultiesRepository(SectionsContext sectionsContext)
        {
            _sectionsContext = sectionsContext;
        }
    }
}
