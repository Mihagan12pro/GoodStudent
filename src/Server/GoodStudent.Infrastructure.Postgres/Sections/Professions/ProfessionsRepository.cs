using GoodStudent.Application.Sections.Professions;
using GoodStudent.Domain.Sections;

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

            return professionEntity.Id;
        }

        public Task<Profession> GeByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public ProfessionsRepository(SectionsContext sectionsContext)
        {
            _sectionsContext = sectionsContext;
        }
    }
}
