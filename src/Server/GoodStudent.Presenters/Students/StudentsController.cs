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
        private readonly IStudentService _studentService;

        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewStudentDto request, CancellationToken cancellationToken)
        {
            return Ok(_studentService.AddNew(request, cancellationToken));
        }

        //[HttpGet]
        //public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        //{
        //    return Ok(id);
        //}

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
        }
    }
}
