using GoodStudent.Application.Students;
using GoodStudent.Infrastracture.Postgres.Instructors;
using GoodStudent.Infrastracture.Postgres.Students;
using Microsoft.Extensions.DependencyInjection;

namespace GoodStudent.Infrastracture.Postgres
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPostgresInfrastructure(this IServiceCollection services)
        {
            services.AddDbContext<StudentsContext>();

            services.AddScoped<IGroupsRepository, GroupsEFRepository>();
            services.AddScoped<IStudentsRepository, StudentsEFRepository>();


            services.AddDbContext<InstructorsContext>();

            return services;
        }
    }
}
