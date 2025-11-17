using GoodStudent.Application.Students;
using Microsoft.Extensions.DependencyInjection;

namespace GoodStudent.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IStudentService, StudentService>();

            return services;
        }
    }
}
