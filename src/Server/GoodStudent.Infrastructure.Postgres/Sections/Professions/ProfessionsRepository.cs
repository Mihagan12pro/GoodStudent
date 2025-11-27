using GoodStudent.Application.Sections.Professions;
using GoodStudent.Domain.Sections;
using Microsoft.EntityFrameworkCore;

namespace GoodStudent.Infrastracture.Postgres.Sections.Professions
{
    internal class ProfessionsRepository : IProfessionsRepository
    {
        private readonly SectionsContext _sectionsContext;

        public async Task<Guid> AddAsync(Profession profession, CancellationToken cancellationToken)
        {
            ProfessionEntity professionEntity = new ProfessionEntity()
            {
                Code = profession.Code,

                Tittle = profession.Tittle,

                Profile = profession.Profile,

                DepartmentId = profession.DepartmentId
            };

            await _sectionsContext.Professions.AddAsync(professionEntity, cancellationToken);
            await _sectionsContext.SaveChangesAsync();

            return professionEntity.Id;
        }

        public async Task<Profession> GeByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            ProfessionEntity? professionEntity = await _sectionsContext.Professions.
                FirstOrDefaultAsync(p => p.Id == id);

            if (professionEntity == null)
                return null!;

            Profession profession = new Profession()
            {
                Tittle = professionEntity.Tittle,

                Profile = professionEntity.Profile,

                Code = professionEntity.Code,

                DepartmentId = professionEntity.DepartmentId
            };

            return profession;
        }

        public ProfessionsRepository(SectionsContext sectionsContext)
        {
            _sectionsContext = sectionsContext;
        }
    }
}
