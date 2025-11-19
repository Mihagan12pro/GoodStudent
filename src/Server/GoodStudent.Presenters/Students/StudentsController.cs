using GoodStudent.Application.Students;
using GoodStudent.Contracts.Students;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Students
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentsService _studentService;

        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewStudentDto request, CancellationToken cancellationToken)
        {
            var result = await _studentService.AddNew(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            return Ok(await _studentService.GetById(id, cancellationToken));
        }

        public StudentsController(IStudentsService studentService)
        {
            _studentService = studentService;
        }
    }
}
