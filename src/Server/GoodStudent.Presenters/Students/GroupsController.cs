using Microsoft.AspNetCore.Mvc;
using GoodStudent.Contracts.Students.GroupsContracts;
using GoodStudent.Application.Students.Groups;

namespace GoodStudent.Presenters.Students
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupsService _groupsService;

        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewGroupDto request, CancellationToken cancellationToken)
        {
            return Ok(await _groupsService.Add(request, cancellationToken));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var result = await _groupsService.GetGroupById(id, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{number}/id")]
        public async Task<IActionResult> GetIdByNumber([FromRoute] string number, CancellationToken cancellationToken)
        {
            var result = await _groupsService.GetIdByNumber(number, cancellationToken);

            return Ok(result);
        }

        [HttpGet("{id}/students")]
        public async Task<IActionResult> GetStudents([FromRoute] Guid id, CancellationToken cancellationToken)
        {
            var result = await _groupsService.GetStudents(id, cancellationToken);

            return Ok(result);
        }

   
        public GroupsController(IGroupsService groupsService)
        {
            _groupsService = groupsService;
        }
    }
}
