using GoodStudent.Contracts.Sections.Departments;
using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Sections
{
    [ApiController]
    [Route("api/sections/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewDepartmentDto request)
        {
            throw new NotImplementedException();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            throw new NotImplementedException();
        }

        [HttpGet("ids")]
        public async Task<IActionResult> GetId([FromQuery] string tittle)
        {
            throw new NotImplementedException();
        }

        [HttpGet()]
        public async Task<IActionResult> GetProfessions([FromQuery] Guid id)
        {
            throw new NotImplementedException();
        }
    }
}
