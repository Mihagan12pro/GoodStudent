using GoodStudent.Contracts.Students;
using GoodStudent.Domain.Students;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace GoodStudent.Presenters.Students
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        [HttpPost]
        public async Task <IActionResult> New([FromBody] NewStudentDto request)
        {
            Student student = new Student()
            {
                Name = request.Name,

                Surname = request.Surname,

                Patronymic = request.Patronymic,

                BirthDate = request.BirthDate,

                StartYear = request.StartYear,

                EducationType = request.EducationType,

                Status = request.Status
            };

            student.Id = Guid.NewGuid();

            return Ok(JsonSerializer.Serialize(student));
        }
    }
}
