using GoodStudent.Contracts.Students.GroupsContracts;
using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Students
{
    internal class GroupsService : IGroupsService
    {
        private readonly IGroupsRepository _groupsRepository;

        public async Task<Guid> Add(NewGroupDto newGroup, CancellationToken cancellationToken)
        {
            Group group = new Group() { Number = newGroup.Number, ProfessionId = newGroup.ProfessionId };

            Guid id = await _groupsRepository.AddAsync(group, cancellationToken);


            return id;
        }

        public async Task<GetStudentsByGroupDto> GetStudents(Guid groupId, CancellationToken cancellationToken)
        {
            (Group, IEnumerable<Student>)? groupStudents = await _groupsRepository.GetStudentsAsync(groupId, cancellationToken);

            if (groupStudents == null)
                throw new NullReferenceException();

            List<(string, string, string)> studentsNames = new List<(string, string, string)>();

            IEnumerable<Student> students = groupStudents.Value.Item2;
            string groupNumber = groupStudents.Value.Item1.Number;

            foreach (Student student in students)
            {
                studentsNames.Add((student.Name!, student.Surname!, student.Patronymic!));
            }

            return new GetStudentsByGroupDto(groupNumber, studentsNames!);
        }

        public async Task<GetGroupByIdDto> GetGroupById(Guid Id, CancellationToken cancellationToken)
        {
            Group group = await _groupsRepository.GetByIdAsync(Id, cancellationToken);

            if (group == null)
                throw new NullReferenceException();

            return new GetGroupByIdDto(group.Number, group.ProfessionId);
        }

        public GroupsService(IGroupsRepository groupsRepository)
        {
            _groupsRepository = groupsRepository;
        }
    }
}
