using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Contracts.Students.GroupsContracts
{
    public record PatchGroupProfessionDto(Guid GroupId, Guid ProfessionId);
}
