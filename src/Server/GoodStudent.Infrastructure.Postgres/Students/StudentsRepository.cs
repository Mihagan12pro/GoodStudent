using Dapper;
using GoodStudent.Application;
using GoodStudent.Application.Students;
using GoodStudent.Domain.Students;
using System.Data;

namespace GoodStudent.Infrastracture.Postgres.Students
{
    public class StudentsRepository : IStudentsRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public async Task<Guid> AddAsync(Student student, CancellationToken cancellationToken)
        {
            try
            {
                const string sql = @"""
                    INSERT INTO Students (name, surname, patronymic, birth_date, group_id)
                    VALUES (@Name, @Surname, @Patronymic, @BirthDate, @GroupId)
                """
                ;

                using IDbConnection connection = _connectionFactory.CreateConnection();
                connection.Open();

                await connection.ExecuteAsync(sql, student);

                connection.Close();
            }
            catch
            {
                Console.WriteLine();
            }

            return Guid.NewGuid();
        }

        public Task<Group> GetGroupByStudentAsync(Guid studentId)
        {
            throw new NotImplementedException();
        }

        public StudentsRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }
    }
}
