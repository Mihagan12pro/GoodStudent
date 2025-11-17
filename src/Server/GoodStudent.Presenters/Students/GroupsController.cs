using GoodStudent.Contracts.Students;
using Microsoft.AspNetCore.Mvc;
using GoodStudent.Domain.Students;
using System.Text.Json;

namespace GoodStudent.Presenters.Students
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewGroupDto request)
        {
            Group group = new Group()
            {
                Code = request.Code,

                FacultyId = request.FacultyId
            };

            return Ok(JsonSerializer.Serialize(group));
        }

        [HttpPatch("{groupId:guid}/{studentId:guid}")]
        public async Task<IActionResult> Add([FromRoute]Guid groupId, [FromRoute]Guid studentId)
        {
            return Ok();
        }

        [HttpGet("{groupId:guid}")]
        public async Task<IActionResult> Students([FromRoute] Guid groupId)
        {
            return Ok();
        }

        [HttpGet("{groupId:guid}/{studentId:guid}")]
        public async Task<IActionResult> StudentById([FromRoute] Guid groupId, [FromRoute] Guid studentId)
        {
            return Ok();
        }
    }
}
