using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GoodStudent.Domain.Students.Enums
{
    public enum StudentStatus
    {
        /// <summary>
        /// Учится
        /// </summary>
        Study,

        /// <summary>
        /// В академическом отпуске
        /// </summary>
        Vacation,

        /// <summary>
        /// Окончил
        /// </summary>
        Finished,

        /// <summary>
        /// Отчислен
        /// </summary>
        Washout
    }
}
