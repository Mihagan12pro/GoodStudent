using GoodStudent.Application.Students;
using GoodStudent.Contracts.Students;
using GoodStudent.Domain.Students;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

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

        [HttpGet]
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
