using GoodStudent.Domain.Sections;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Sections.Professions
{
    public interface IProfessionsRepository
    {
        Task<Guid> AddAsync(Profession profession, CancellationToken cancellationToken);

        Task<Profession> GeByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetIdByTittleAsync(Profession profession, CancellationToken cancellationToken);
    }
}
