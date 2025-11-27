using GoodStudent.Contracts.Instructors;
using GoodStudent.Domain.Instructors;

namespace GoodStudent.Application.Instructors
{
    public interface IInstructorsRepository
    {
        Task<Instructor> UpdateInstructorAsync(Instructor instructor, CancellationToken cancellationToken);

        Task<Guid> AddNewAsync(Instructor instructor, CancellationToken cancellationToken);

        Task<Instructor?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

        Task<Guid> GetIdAsync(Instructor instructor, CancellationToken cancellationToken);
    }
}
