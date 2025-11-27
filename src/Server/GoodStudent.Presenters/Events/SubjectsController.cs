using GoodStudent.Application.Events.Subjects;
using GoodStudent.Contracts.Events.Subjects;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Events
{
    [ApiController]
    [Route("api/events/[controller]")]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;

        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewSubjectDto request, CancellationToken cancellationToken)
        {
            var result = await _subjectService.AddNew(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var result = await _subjectService.GetById(id, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{tittle}/id")]
        public async Task<IActionResult> GetIdByName([FromRoute] string tittle, CancellationToken cancellationToken)
        {
            var result = await _subjectService.GetIdByTittle(tittle, cancellationToken);

            return Ok(result);
        }

        public SubjectsController(ISubjectService subjectService)
        {
            _subjectService = subjectService;
        }
    }
}
