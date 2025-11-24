using GoodStudent.Contracts.Sections.Departments;
using GoodStudent.Contracts.Sections.Faculties;
using GoodStudent.Domain.Sections;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Application.Sections.Faculties
{
    internal class FacultiesService : IFacultiesService
    {
        private readonly IFacultiesRepository _faultiesRepository;

        public async Task<Guid> Add(NewFacultyDto request, CancellationToken cancellationToken)
        {
            Faculty faculty = new Faculty()
            { Tittle =  request.Tittle, Description = request.Description };

            Guid id = await _faultiesRepository.AddAsync(faculty, cancellationToken);

            return id;
        }

        public async Task<IEnumerable<GetFacultyDto>> GetAll(CancellationToken cancellationToken)
        {
            IEnumerable<Faculty> facylties = await _faultiesRepository.GetAdllAsync(cancellationToken);

            IEnumerable<GetFacultyDto> respone = facylties.Select(f => new GetFacultyDto(f.Tittle, f.Description));

            return respone;
        }

        public async Task<GetFacultyDto> GetById(Guid id, CancellationToken cancellationToken)
        {
            Faculty faculty = await _faultiesRepository.GetByIdAsync(id, cancellationToken);

            if (faculty == null)
                throw new NullReferenceException();

            GetFacultyDto response = new GetFacultyDto(faculty.Tittle, faculty.Description);

            return response;
        }

        public async Task<Guid> GetId(string tittle, CancellationToken cancellationToken)
        {
            Guid id = await _faultiesRepository.GetIdAsync(tittle, cancellationToken);

            if (id == Guid.Empty)
                throw new NullReferenceException();

            return id;
        }

        public async Task<IEnumerable<GetDepartmentDto>> GetDepartments(Guid id, CancellationToken cancellationToken)
        {
            IEnumerable<Department> departments = await _faultiesRepository.GetDepartmentsAsync(id, cancellationToken);

            if (departments == null)
                throw new NullReferenceException();

            IEnumerable<GetDepartmentDto> response = departments.Select(d => new GetDepartmentDto(d.Tittle, d.Description));

            return response;
        }

        public FacultiesService(IFacultiesRepository facultiesRepository)
        {
            _faultiesRepository = facultiesRepository;
        }
    }
}
