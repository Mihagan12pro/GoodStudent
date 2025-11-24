using GoodStudent.Contracts.Sections.Professions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Sections.Professions
{
    public interface IProfessionService
    {
        Task<Guid> AddNew(NewProfessionDto resuest, CancellationToken cancellationToken);

        Task<GetProfessionDto> GetById(Guid id, CancellationToken cancellationToken);
    }
}
