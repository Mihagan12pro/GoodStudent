using GoodStudent.Contracts.Students.GroupsContracts;
using GoodStudent.Contracts.Students.StudentsContracts;
using GoodStudent.Domain.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
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

            var students = groupStudents.Value.Item2.Select(student =>
                new GetStudentFullNameDto(student.Name, student.Surname, student.Patronymic)
            );

            string groupNumber = groupStudents.Value.Item1.Number;

            return new GetStudentsByGroupDto(groupNumber, students);
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
