using GoodStudent.Application;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Infrastracture.Postgres
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddPostgresInfrastructure(this IServiceCollection services)
        {
            services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();
            //services.AddScoped<I>

            return services;
        }
    }
}
