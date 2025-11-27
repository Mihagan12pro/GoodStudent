using GoodStudent.Application.Sections.Professions;
using GoodStudent.Domain.Sections;
using Microsoft.EntityFrameworkCore;

namespace GoodStudent.Infrastracture.Postgres.Sections.Professions
{
    internal class ProfessionsRepository : GoodStudentRepository, IProfessionsRepository
    {
        public ProfessionsRepository(GoodStudentContext context) : base(context)
        {
        }

        public async Task<Guid> AddAsync(Profession profession, CancellationToken cancellationToken)
        {
            ProfessionEntity professionEntity = new ProfessionEntity()
            {
                Code = profession.Code,

                Tittle = profession.Tittle,

                Profile = profession.Profile,

                DepartmentId = profession.DepartmentId
            };

            await context.Professions.AddAsync(professionEntity, cancellationToken);
            await context.SaveChangesAsync();

            return professionEntity.Id;
        }

        public async Task<Profession> GeByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            ProfessionEntity? professionEntity = await context.Professions.
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

        public async Task<Guid> GetIdByTittleAsync(Profession profession, CancellationToken cancellationToken)
        {
            Guid id = await context.Professions.
                Where(p => p.Tittle == profession.Tittle 
                        &&
                        p.Code == profession.Code 
                        &&
                        p.Profile == profession.Profile
                    ).
                    Select(p => p.Id).
                        FirstOrDefaultAsync();

            return id;
        }
    }
}
