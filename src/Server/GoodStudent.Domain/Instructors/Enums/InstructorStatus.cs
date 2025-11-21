using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Instructors.Enums
{
    public enum InstructorStatus
    {
        /// <summary>
        /// Преподает
        /// </summary>
        Teaching,

        /// <summary>
        /// Не работает (уволился или уволен)
        /// </summary>
        Dismissed,

        /// <summary>
        /// Отпуск
        /// </summary>
        Vacation
    }
}
