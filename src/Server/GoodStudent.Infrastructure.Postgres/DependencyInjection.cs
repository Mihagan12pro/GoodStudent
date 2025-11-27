using GoodStudent.Application.Events.Subjects;
using GoodStudent.Application.Instructors;
using GoodStudent.Application.Sections.Departments;
using GoodStudent.Application.Sections.Faculties;
using GoodStudent.Application.Sections.Professions;
using GoodStudent.Application.Students.Groups;
using GoodStudent.Application.Students.Students;
using GoodStudent.Infrastracture.Postgres.Events;
using GoodStudent.Infrastracture.Postgres.Events.Subjects;
using GoodStudent.Infrastracture.Postgres.Instructors;
using GoodStudent.Infrastracture.Postgres.Sections;
using GoodStudent.Infrastracture.Postgres.Sections.Departments;
using GoodStudent.Infrastracture.Postgres.Sections.Faculties;
using GoodStudent.Infrastracture.Postgres.Sections.Professions;
using GoodStudent.Infrastracture.Postgres.Students;
using GoodStudent.Infrastracture.Postgres.Students.Groups;
using GoodStudent.Infrastracture.Postgres.Students.Students;
using Microsoft.Extensions.DependencyInjection;

namespace GoodStudent.Infrastracture.Postgres;

public static class DependencyInjection
{
    public static IServiceCollection AddPostgresInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<GoodStudentContext>();

        services.AddScoped<IGroupsRepository, GroupsRepository>();
        services.AddScoped<IStudentsRepository, StudentsRepository>();
        services.AddScoped<IFacultiesRepository, FacultiesRepository>();
        services.AddScoped<IDepartmentsRepository, DepartmentsRepository>();
        services.AddScoped<IProfessionsRepository, ProfessionsRepository>();
        services.AddScoped<IInstructorsRepository, InstructorRepository>();
        services.AddScoped<ISubjectsRepository, SubjectsRepository>();

        return services;
    }
}
