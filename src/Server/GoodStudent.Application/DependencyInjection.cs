using GoodStudent.Application.Sections.Departments;
using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Application.Students;
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
          
            return services;
        }
    }
}
