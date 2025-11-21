using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Presenters.Instructors
{
    [ApiController]
    [Route("api/[controller]")]
    internal class GradesController : ControllerBase
    {
        public async Task<IActionResult> New()
        {
            return Ok();
        }
    }
}
