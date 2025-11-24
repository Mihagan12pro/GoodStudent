using GoodStudent.Contracts.Sections.Professions;
using GoodStudent.Domain.Sections;

namespace GoodStudent.Application.Sections.Professions
{
    internal class ProfessionService : IProfessionService
    {
        private readonly IProfessionsRepository _professionsRepository;

        public async Task<Guid> AddNew(NewProfessionDto request, CancellationToken cancellationToken)
        {
            Profession profession = new Profession()
            { 
                Code = request.Code, 
                
                Tittle = request.Tittle, 
                
                Profile = request.Profile, 
            
                DepartmentId = request.DepartmentId 
            };

            Guid id = await _professionsRepository.AddAsync(profession, cancellationToken);

            return id;
        }

        public async Task<GetProfessionDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Profession profession = await _professionsRepository.GeByIdAsync(id, cancellationToken);

            if (profession == null)
                throw new NullReferenceException();

            GetProfessionDto response = new GetProfessionDto(profession.Tittle, profession.Code, profession.Profile);

            return response;
        }

        public ProfessionService(IProfessionsRepository professionsRepository)
        {
            _professionsRepository = professionsRepository;
        }
    }
}
