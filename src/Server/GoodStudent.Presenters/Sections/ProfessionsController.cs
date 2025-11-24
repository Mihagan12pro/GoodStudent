using GoodStudent.Contracts.Sections.Professions;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Sections
{
    [ApiController]
    [Route("api/sections/[controller]")]
    public class ProfessionsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewProfessionDto request, CancellationToken cancellationToken)
        {
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            return Ok();
        }
    }
}
