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
        [HttpPost]
        public async Task<IActionResult> New([FromBody] NewStudentDto request)
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

        [HttpGet]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            return Ok(id);
        }


        //[HttpGet("{groupId:guid}/{Id:guid}")]
        //public async Task<IActionResult>GetByGroup()
        //{

        //}
    }
}
