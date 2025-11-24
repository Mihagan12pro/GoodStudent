using GoodStudent.Application.Sections.Departments;
using GoodStudent.Contracts.Sections.Departments;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Sections
{
    [ApiController]
    [Route("api/sections/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentsService _departmentsService;

        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewDepartmentDto request, CancellationToken cancellationToken)
        {
            var result = await _departmentsService.AddNew(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var result = await _departmentsService.GetById(id, cancellationToken);

            return Ok(result);
        }

        [HttpGet("ids")]
        public async Task<IActionResult> GetId([FromQuery] string tittle, CancellationToken cancellationToken)
        {
            var result = await _departmentsService.GetId(tittle, cancellationToken);

            return Ok(result);
        }

        [HttpGet()]
        public async Task<IActionResult> GetProfessions([FromQuery] Guid id, CancellationToken cancellationToken)
        {
            var result = await _departmentsService.GetProfessions(id, cancellationToken);

            return Ok(result);
        }

        public DepartmentsController(IDepartmentsService departmentsService)
        {
            _departmentsService = departmentsService;
        }
    }
}
