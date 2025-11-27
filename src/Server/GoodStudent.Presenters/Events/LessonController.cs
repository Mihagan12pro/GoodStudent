using Microsoft.AspNetCore.Mvc;

namespace GoodStudent.Presenters.Events
{
    [ApiController]
    [Route("api/sections/[controller]")]
    public class LessonController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> New(CancellationToken cancellationToken)
        {
            return Ok();
        }
    }
}
