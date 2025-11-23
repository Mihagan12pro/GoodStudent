using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Contracts.Sections.Faculties;
using GoodStudent.Contracts.Students.StudentsContracts;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

        [HttpGet("/All")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _facultiesService.GetAll(cancellationToken);

            return Ok(result);
        }

        public FacultyController(IFacultiesService facultiesService)
        {
            _facultiesService = facultiesService;
        }
    }
}
