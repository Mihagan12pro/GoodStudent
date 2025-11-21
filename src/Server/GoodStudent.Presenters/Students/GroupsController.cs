using Microsoft.AspNetCore.Mvc;
using GoodStudent.Domain.Students;
using System.Text.Json;
using GoodStudent.Application.Students;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using GoodStudent.Contracts.Students.GroupsContracts;

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

        [HttpGet("{id}")]
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
