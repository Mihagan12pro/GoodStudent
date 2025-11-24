using GoodStudent.Application.Instructors;
using GoodStudent.Contracts.Instructors;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Instructors
{
    [ApiController()]
    [Route("api/[controller]")]
    public class InstructorsController : ControllerBase
    {
        private readonly IInstructorService _instructorService;

        [HttpPost]
        public async Task<IActionResult> New([FromBody]NewInstructorDto request, CancellationToken cancellationToken)
        {
            var result = await _instructorService.AddNew(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetId([FromQuery] GetInstructorDto request, CancellationToken cancellationToken)
        {
            var result = await _instructorService.GetId(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{result}")]
        public async Task<IActionResult> GetById([FromRoute]Guid id, CancellationToken cancellationToken)
        {
            var result = await _instructorService.GetById(id, cancellationToken);

            return Ok();
        }

        public InstructorsController(IInstructorService instructorService)
        {
            _instructorService = instructorService;
        }
    }
}
