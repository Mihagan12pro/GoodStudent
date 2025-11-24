using GoodStudent.Application.Sections.Departments;
using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Application.Sections.Professions;
using GoodStudent.Application.Students;
using GoodStudent.Infrastracture.Postgres.Sections;
using GoodStudent.Infrastracture.Postgres.Sections.Departments;
using GoodStudent.Infrastracture.Postgres.Sections.Faculties;
using GoodStudent.Infrastracture.Postgres.Sections.Professions;
using GoodStudent.Infrastracture.Postgres.Students;
using Microsoft.Extensions.DependencyInjection;

namespace GoodStudent.Infrastracture.Postgres;

public static class DependencyInjection
{
    public static IServiceCollection AddPostgresInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<StudentsContext>();

        services.AddScoped<IGroupsRepository, GroupsRepository>();
        services.AddScoped<IStudentsRepository, StudentsRepository>();


        services.AddDbContext<SectionsContext>();

        services.AddScoped<IFacultiesRepository, FacultiesRepository>();
        services.AddScoped<IDepartmentsRepository, DepartmentsRepository>();
        services.AddScoped<IProfessionsRepository, ProfessionsRepository>();

        return services;
    }
}
