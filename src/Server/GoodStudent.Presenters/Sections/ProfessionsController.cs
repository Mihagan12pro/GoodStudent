using GoodStudent.Application.Sections.Professions;
using GoodStudent.Contracts.Sections.Professions;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Sections
{
    [ApiController]
    [Route("api/sections/[controller]")]
    public class ProfessionsController : ControllerBase
    {
        private readonly IProfessionService _professionService; 

        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewProfessionDto request, CancellationToken cancellationToken)
        {
            var result = await _professionService.AddNew(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var result = await _professionService.GetById(id, cancellationToken);

            return Ok(result);
        }

        [HttpGet("id/")]
        public async Task<IActionResult> GetIdByTittle([FromQuery] GetProfessionDto request, CancellationToken cancellationToken)
        {
            var result = await _professionService.GetIdByTittle(request, cancellationToken);

            return Ok(result);
        }

        public ProfessionsController(IProfessionService professionService)
        {
            _professionService = professionService;
        }
    }
}
