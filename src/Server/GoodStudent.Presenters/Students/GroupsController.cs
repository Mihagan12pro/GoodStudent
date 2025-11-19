using GoodStudent.Contracts.Students;
using Microsoft.AspNetCore.Mvc;
using GoodStudent.Domain.Students;
using System.Text.Json;
using GoodStudent.Application.Students;
using Microsoft.AspNetCore.Authorization.Infrastructure;

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
            return Ok(await _groupsService.AddAsync(request));
        }

        public GroupsController(IGroupsService groupsService)
        {
            _groupsService = groupsService;
        }
    }
}
