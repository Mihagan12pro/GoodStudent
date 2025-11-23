using GoodStudent.Domain.Sections;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Sections.Faculties
{
    public interface IFacultiesRepository
    {
        Task<Guid> AddAsync(Faculty faculty, CancellationToken cancellationToken);

        Task<Faculty> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<IEnumerable<Faculty>> GetAdllAsync(CancellationToken cancellationToken);
    }
}
