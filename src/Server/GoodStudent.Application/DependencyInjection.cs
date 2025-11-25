using GoodStudent.Application.Instructors;
using GoodStudent.Application.Sections.Departments;
using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Application.Sections.Professions;
using GoodStudent.Application.Students.Groups;
using GoodStudent.Application.Students.Students;
using Microsoft.Extensions.DependencyInjection;

namespace GoodStudent.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IStudentsService, StudentsService>();
            services.AddScoped<IGroupsService, GroupsService>();

            services.AddScoped<IFacultiesService, FacultiesService>();
            services.AddScoped<IDepartmentsService, DepartmentsService>();
            services.AddScoped<IProfessionService, ProfessionService>();

            services.AddScoped<IInstructorService, InstructorService>();
          
            return services;
        }
    }
}
