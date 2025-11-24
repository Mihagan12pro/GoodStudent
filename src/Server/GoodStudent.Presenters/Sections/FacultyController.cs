using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Contracts.Sections.Faculties;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Sections
{
    [ApiController]
    [Route("api/sections/[controller]")]
    public class FacultyController : ControllerBase
    {
        private readonly IFacultiesService _facultiesService;

        [HttpPost]
        public async Task<IActionResult> New([FromBody]NewFacultyDto request, CancellationToken cancellationToken)
        {
            var result = await _facultiesService.Add(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute]Guid id, CancellationToken cancellationToken)
        {
            var result = await _facultiesService.GetById(id, cancellationToken);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetId([FromQuery]string tittle, CancellationToken cancellationToken)
        {
            var result = await _facultiesService.GetId(tittle, cancellationToken);

            return Ok(result);
        }

        [HttpGet("/All")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _facultiesService.GetAll(cancellationToken);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllDepartments([FromQuery] Guid id, CancellationToken cancellationToken)
        {
            var result = await _facultiesService.GetDepartments(id, cancellationToken);

            return Ok(result);
        }

        public FacultyController(IFacultiesService facultiesService)
        {
            _facultiesService = facultiesService;
        }
    }
}
