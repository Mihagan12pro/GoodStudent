class TeacherApp{
constructor(){
if(!localStorage.getItem('authToken')){
window.location.href='/form.html';
return;
}
this.currentUser=JSON.parse(localStorage.getItem('user')||'{}');
this.students=[];
this.groups=[];
this.subjects=[];
this.assignments=[];
this.currentGroupId='all';
this.currentSubjectId='all';
this.currentView='manual';
this.currentDate = new Date();
this.currentMonth = this.currentDate.getMonth();
this.currentYear = this.currentDate.getFullYear();
this.init();
}
initCalendar() {
    this.renderCalendar();
    this.setupCalendarEvents();
}
// function generateQRCode(lessonId) {
//     window.open(`/qr-generator.html?lesson=${lessonId}`, '_blank');
// }
filterStudentsByCurrentTime() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
        const today = now.toISOString().split('T')[0];
        
        console.log('Фильтрация по времени:', { currentTime, today });
        const currentAssignments = this.assignments.filter(assignment => {
            if (!assignment.assignment_date) return false;
            
            const assignmentDate = assignment.assignment_date.split('T')[0];
            const isToday = assignmentDate === today;
            const isCurrentTime = this.isTimeInRange(
                currentTime, 
                assignment.start_time, 
                assignment.end_time
            );
            
            console.log(`Проверка занятия: ${assignment.subject_name}, дата: ${assignmentDate}, сегодня: ${isToday}, время: ${assignment.start_time}-${assignment.end_time}, текущее: ${isCurrentTime}`);
            
            return isToday && isCurrentTime;
        });
        
        console.log('Текущие занятия:', currentAssignments);
        
        if (currentAssignments.length > 0) {
            const currentGroupIds = currentAssignments.map(a => a.group_id);
            this.currentGroupId = currentGroupIds[0];
            const groupSelect = document.getElementById('group-select');
            if (groupSelect) {
                groupSelect.value = this.currentGroupId;
            }
            const subjectSelect = document.getElementById('subject-select');
            if (subjectSelect && currentAssignments[0].subject_id) {
                subjectSelect.value = currentAssignments[0].subject_id;
                this.currentSubjectId = currentAssignments[0].subject_id;
            }
            
            alert(`Автоматически загружены студенты для текущего занятия: ${currentAssignments[0].subject_name}`);
        } else {
            this.showNoCurrentClassesMessage();
        }
        
        this.renderStudents();
    }
    isTimeInRange(currentTime, startTime, endTime) {
        if (!startTime || !endTime) return false;
        
        const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const currentTotal = currentHours * 60 + currentMinutes;
        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;
        
        return currentTotal >= startTotal && currentTotal <= endTotal;
    }
    showNoCurrentClassesMessage() {
        const container = document.getElementById('students-list');
        if (!container) return;
        
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <h4>Сейчас нет активных занятий</h4>
                <p>Вы можете вручную выбрать группу и предмет для отметки посещаемости</p>
                <div style="margin-top:20px;">
                    <button class="btn-primary" onclick="teacherApp.showAllStudents()">
                        Показать всех студентов
                    </button>
                </div>
            </div>
        `;
    }
   showAllStudents() {
    this.currentGroupId = 'all';
    this.currentSubjectId = 'all';
    const groupSelect = document.getElementById('group-select');
    if (groupSelect) groupSelect.value = 'all';
    const subjectSelect = document.getElementById('subject-select');
    if (subjectSelect) subjectSelect.value = 'all';
    const notification = document.querySelector('.current-lesson-notification');
    const message = document.querySelector('.no-lesson-message');
    if (notification) notification.remove();
    if (message) message.remove();
    
    this.renderStudents();
}
   async init() {
       onsole.log('Инициализация приложения преподавателя');
    await this.loadTeacherData();
    await this.loadInstructorAssignments();
    this.setupEventListeners();
    this.setupGroupSelectorsSync();
    this.displayCurrentDate();
    this.initCalendar();
    this.debugAssignmentDates();
    setTimeout(() => {
        this.loadStudentsForCurrentLesson();
    }, 1000);
    }
    loadStudentsForCurrentLesson() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    const today = now.toISOString().split('T')[0];
    const currentDayOfWeek = now.getDay(); // 0-воскресенье, 1-понедельник...
    console.log('=== ПОИСК ТЕКУЩЕГО ЗАНЯТИЯ ===');
    console.log('Сегодня:', today, 'Текущее время:', currentTime, 'День недели:', currentDayOfWeek);
    const currentAssignments = this.assignments.filter(assignment => {
        if (!assignment.assignment_date) return false;
        
        const assignmentDate = assignment.assignment_date.split('T')[0];
        const isToday = assignmentDate === today;
        const isCurrentTime = this.isTimeInRangeWithMargin(
            currentTime, 
            assignment.start_time, 
            assignment.end_time,
            15 
        );
        console.log(`Проверка занятия: ${assignment.subject_name}, 
            дата: ${assignmentDate}, сегодня: ${isToday}, 
            время: ${assignment.start_time}-${assignment.end_time}, 
            текущее: ${isCurrentTime}`);
        
        return isToday && isCurrentTime;
    });
    console.log('Текущие занятия:', currentAssignments);
    if (currentAssignments.length > 0) {
        const currentAssignment = currentAssignments[0];
        this.currentGroupId = currentAssignment.group_id;
        this.currentSubjectId = currentAssignment.subject_id;
        console.log('Автоматически выбрано занятие:', {
            предмет: currentAssignment.subject_name,
            группа: currentAssignment.group_number,
            группаId: this.currentGroupId,
            предметId: this.currentSubjectId
        });
        const groupSelect = document.getElementById('group-select');
        if (groupSelect && this.currentGroupId) {
            groupSelect.value = this.currentGroupId;
        }
        
        const subjectSelect = document.getElementById('subject-select');
        if (subjectSelect && this.currentSubjectId) {
            subjectSelect.value = this.currentSubjectId;
        }
        this.showCurrentLessonNotification(currentAssignment);
        
    } else {

        this.showNoCurrentLessonMessage();
    }
    this.renderStudents();
}
isTimeInRangeWithMargin(currentTime, startTime, endTime, marginMinutes = 15) {
    if (!startTime || !endTime) return false;
    
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const currentTotal = currentHours * 60 + currentMinutes;
    const startTotal = startHours * 60 + startMinutes - marginMinutes; // Запас до начала
    const endTotal = endHours * 60 + endMinutes + marginMinutes; // Запас после окончания
    
    return currentTotal >= startTotal && currentTotal <= endTotal;
}
showCurrentLessonNotification(assignment) {
    const notification = `
        <div class="current-lesson-notification" style="
            background: #e8f5e8;
            border: 1px solid #28a745;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
            text-align: center;
        ">
            <h4 style="margin: 0 0 8px 0; color: #155724;">
                Автоматически загружено текущее занятие
            </h4>
            <p style="margin: 0; color: #155724;">
                <strong>${assignment.subject_name}</strong> - 
                Группа ${assignment.group_number} - 
                ${assignment.start_time} - ${assignment.end_time}
            </p>
            <small style="color: #28a745;">
                Студенты группы автоматически загружены для отметки посещаемости
            </small>
        </div>
    `;
    
    // Вставляем уведомление перед списком студентов
    const studentsList = document.getElementById('students-list');
    if (studentsList) {
        studentsList.insertAdjacentHTML('beforebegin', notification);
    }
}
showNoCurrentLessonMessage() {
    const message = `
        <div class="no-lesson-message" style="
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
            text-align: center;
        ">
            <h4 style="margin: 0 0 10px 0; color: #856404;">
                Сейчас нет активных занятий
            </h4>
            <p style="margin: 0 0 15px 0; color: #856404;">
                Выберите группу и предмет вручную для отметки посещаемости
            </p>
            <button class="btn-primary" onclick="teacherApp.showAllStudents()" 
                    style="padding: 8px 16px; font-size: 14px;">
                Показать всех студентов
            </button>
        </div>
    `;
    
    const studentsList = document.getElementById('students-list');
    if (studentsList) {
        studentsList.insertAdjacentHTML('beforebegin', message);
    }
}
    filterStudentsByCurrentTime() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
        const today = now.toISOString().split('T')[0];
        const currentDayOfWeek = now.getDay(); // 0-воскресенье, 1-понедельник...
        
        console.log('=== ФИЛЬТРАЦИЯ ПО ТЕКУЩЕМУ ВРЕМЕНИ ===');
        console.log('Сегодня:', today, 'Текущее время:', currentTime, 'День недели:', currentDayOfWeek);
        const todaysAssignments = this.assignments.filter(assignment => {
            if (!assignment.assignment_date) return false;
            
            const assignmentDate = assignment.assignment_date.split('T')[0];
            const isToday = assignmentDate === today;
            
            console.log(`Проверка занятия: ${assignment.subject_name}, дата: ${assignmentDate}, сегодня: ${isToday}`);
            
            return isToday;
        });
        console.log('Занятия на сегодня:', todaysAssignments);

        if (todaysAssignments.length > 0) {
            const currentGroupIds = todaysAssignments.map(a => a.group_id);
            const currentSubjectIds = todaysAssignments.map(a => a.subject_id);
            this.currentGroupId = currentGroupIds[0] || 'all';
            this.currentSubjectId = currentSubjectIds[0] || 'all';
            const groupSelect = document.getElementById('group-select');
            if (groupSelect && this.currentGroupId !== 'all') {
                groupSelect.value = this.currentGroupId;
            }
            const subjectSelect = document.getElementById('subject-select');
            if (subjectSelect && this.currentSubjectId !== 'all') {
                subjectSelect.value = this.currentSubjectId;
            }
            console.log('Автоматически установлены фильтры:', {
                группа: this.currentGroupId,
                предмет: this.currentSubjectId
            });
            this.showCurrentScheduleMessage(todaysAssignments);
        } else {
            this.showNoClassesTodayMessage();
        }
        this.renderStudents();
    }
    showCurrentScheduleMessage(assignments) {
        const subjectNames = [...new Set(assignments.map(a => a.subject_name))];
        const groupNames = [...new Set(assignments.map(a => a.group_number))];
        console.log(`Автоматически загружены студенты для: ${subjectNames.join(', ')} - группы: ${groupNames.join(', ')}`);
    }
    showNoClassesTodayMessage() {
        const container = document.getElementById('students-list');
        if (!container) return;
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const todayString = now.toLocaleDateString('ru-RU', options);
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <h4>Сегодня нет занятий!</h4>
                <p><strong>${todayString}</strong></p>
                <p>Отдыхайте или занимайтесь научной работой</p>
                <div style="margin-top:20px;">
                    <button class="btn-primary" onclick="teacherApp.showAllStudents()">
                        Показать всех студентов
                    </button>
                </div>
            </div>
        `;
    }
renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById('current-month').textContent = 
        `${monthNames[this.currentMonth]} ${this.currentYear}`;
    console.log('=== РЕНДЕРИНГ КАЛЕНДАРЯ ===');
    console.log('Текущий месяц:', this.currentMonth, 'Год:', this.currentYear);
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const monthAssignments = this.getAssignmentsForMonth(this.currentMonth, this.currentYear);
    console.log('Занятия в этом месяце:', monthAssignments);
    let calendarHTML = '';
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(this.currentYear, this.currentMonth, day);
        const dateString = date.toISOString().split('T')[0];
        const isToday = 
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
        const hasClass = monthAssignments.some(assignment => {
            if (!assignment.assignment_date) return false;
            const assignmentDate = new Date(assignment.assignment_date);
            const isSameDate = 
                assignmentDate.getFullYear() === date.getFullYear() &&
                assignmentDate.getMonth() === date.getMonth() &&
                assignmentDate.getDate() === date.getDate();
            return isSameDate;
        });
        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (hasClass) dayClass += ' has-class';
        console.log(`День ${day}: ${dateString}, сегодня: ${isToday}, есть занятия: ${hasClass}`);
        calendarHTML += `
            <div class="${dayClass}" data-date="${dateString}">
                <span class="day-number">${day}</span>
                ${hasClass ? '<span class="class-dot"></span>' : ''}
            </div>
        `;
    }
    calendarGrid.innerHTML = calendarHTML;
}
getAssignmentsForMonth(month, year) {
    return this.assignments.filter(assignment => {
        if (!assignment.assignment_date) return false;
        const assignmentDate = new Date(assignment.assignment_date);
        const isSameMonth = assignmentDate.getMonth() === month;
        const isSameYear = assignmentDate.getFullYear() === year;
        console.log(`Проверка занятия для календаря: ${assignmentDate.toISOString()}, месяц ${assignmentDate.getMonth()}, год ${assignmentDate.getFullYear()} -> ${isSameMonth && isSameYear}`);
        return isSameMonth && isSameYear;
    });
}
setupCalendarEvents() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    calendarGrid.addEventListener('click', (e) => {
        const dayElement = e.target.closest('.calendar-day');
        if (dayElement && !dayElement.classList.contains('empty')) {
            const date = dayElement.dataset.date;
            this.showDaySchedule(date);
        }
    });
}
showDaySchedule(date) {
    console.log('=== ПОКАЗ ЗАНЯТИЙ НА ДЕНЬ ===');
    console.log('Выбранная дата:', date);
    console.log('Все назначения:', this.assignments);
    const dayAssignments = this.assignments.filter(assignment => {
        if (!assignment.assignment_date) {
            console.log('Назначение без даты:', assignment);
            return false;
        }
        const assignmentDate = new Date(assignment.assignment_date);
        const selectedDate = new Date(date);
        const isSameDate = 
            assignmentDate.getFullYear() === selectedDate.getFullYear() &&
            assignmentDate.getMonth() === selectedDate.getMonth() &&
            assignmentDate.getDate() === selectedDate.getDate();
        console.log(`Проверка: ${assignmentDate.toISOString().split('T')[0]} === ${selectedDate.toISOString().split('T')[0]} : ${isSameDate}`);
        console.log(`Предмет: ${assignment.subject_name}, Дата занятия: ${assignment.assignment_date}`);
        return isSameDate;
    });
    console.log('Найденные занятия на выбранную дату:', dayAssignments);
    if (dayAssignments.length === 0) {
        const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        alert(`На ${formattedDate} нет занятий`);
        return;
    }
    const scheduleText = dayAssignments.map(assignment => {
        const timeInfo = assignment.start_time && assignment.end_time 
            ? `${assignment.start_time} - ${assignment.end_time}`
            : '--:-- - --:--';
        return `${timeInfo} - ${assignment.subject_name} (${assignment.group_number}) - ${assignment.classroom || 'Ауд. не указана'}`;
    }).join('\n');
    
    const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    alert(`Занятия на ${formattedDate}:\n\n${scheduleText}`);
}
prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
    }
    this.renderCalendar();
}
nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
    }
    this.renderCalendar();
}
debugAssignmentDates() {
    console.log('ПРОВЕРКА ФОРМАТА ДАТ НАЗНАЧЕНИЙ ');
    this.assignments.forEach((assignment, index) => {
        console.log(`Назначение ${index + 1}:`);
        console.log('  - ID:', assignment.id);
        console.log('  - Предмет:', assignment.subject_name);
        console.log('  - Дата назначения:', assignment.assignment_date);
        console.log('  - Тип даты:', typeof assignment.assignment_date);
        if (assignment.assignment_date) {
            const dateObj = new Date(assignment.assignment_date);
            console.log('  - Объект Date:', dateObj);
            console.log('  - Год:', dateObj.getFullYear());
            console.log('  - Месяц:', dateObj.getMonth());
            console.log('  - День:', dateObj.getDate());
            console.log('  - ISO строка:', dateObj.toISOString());
            console.log('  - Локализованная дата:', dateObj.toLocaleDateString('ru-RU'));
        }
    });
}
async init() {
    console.log('Инициализация приложения преподавателя');
    setTimeout(() => {
        console.log('Проверка элементов DOM:');
        console.log('- save-attendance-btn:', document.getElementById('save-attendance-btn'));
        console.log('- students-list:', document.getElementById('students-list'));
        console.log('- group-select:', document.getElementById('group-select'));
        console.log('- subject-select:', document.getElementById('subject-select'));
    }, 500);
    await this.loadTeacherData();
    await this.loadInstructorAssignments();
    this.setupEventListeners();
    this.setupGroupSelectorsSync();
    this.displayCurrentDate();
    this.initCalendar();
    this.debugAssignmentDates();
    
}
setupGroupSelectorsSync() {
    const mainGroupSelect = document.getElementById('group-select');    
    if (mainGroupSelect) {
        mainGroupSelect.addEventListener('change', (e) => {
            this.currentGroupId = e.target.value;
            this.renderStudents();
        });
        console.log('Селектор групп в основном контенте настроен');
    }
}
async loadTeacherData() {
    try {
        console.log('Загружаем данные преподавателя...');
        const students = await apiClient.getAllStudents();
        const groups = await apiClient.getAllGroups();
        this.students = this.normalizeStudents(students || [], groups || []);
        this.groups = groups || [];
        console.log('Студенты и группы загружены:', {
            students: this.students.length,
            groups: this.groups.length
        });
        await this.loadInstructorAssignments();
        await this.loadAssignedStudents();
        
    } catch(error) {
        console.error('Ошибка загрузки данных:', error);
        this.useDemoData();
    }
}
async loadAssignments(){
try{
const instructorId=this.getCurrentInstructorId();
if(instructorId){
const response=await fetch(`http://localhost:5000/api/instructors/${instructorId}/assignments`);
if(response.ok){
this.assignments=await response.json();
console.log('Назначения преподавателя:',this.assignments);
}else{
const allAssignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
this.assignments=allAssignments.filter(a=>a.instructor_id===instructorId);
}
}else{
const allAssignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
const userName=this.currentUser.name.toLowerCase();
this.assignments=allAssignments.filter(assignment=>{
const instructorName=assignment.instructorName.toLowerCase();
return instructorName.includes(userName);
});
}
this.populateSubjectSelector();
}catch(error){
console.error('Ошибка загрузки назначений:',error);
this.assignments=[];
}
}
// getCurrentInstructorId(){
// const user=this.currentUser;
// if(user&&user.email){
// const instructor=this.getInstructorByEmail(user.email);
// return instructor?instructor.id:null;
// }
// return null;
// }
// getInstructorByEmail(email){
// return{
// id:'1',
// name:'Преподаватель',
// surname:'Тестовый',
// email:email
// };
// }
async loadInstructorAssignments() {
    try {
        const instructorId = this.getCurrentInstructorId();
        console.log('Загрузка назначений для преподавателя:', instructorId);
        
        let assignments = [];
        
        // Пробуем загрузить с сервера
        try {
            const response = await fetch(`http://localhost:5000/api/instructors/${instructorId}/assignments`);
            if (response.ok) {
                assignments = await response.json();
                console.log('Назначения с сервера:', assignments);
            } else {
                console.log('Ошибка ответа сервера:', response.status);
                throw new Error('Server response error');
            }
        } catch (serverError) {
            console.log('Сервер недоступен, используем демо-данные:', serverError);
            assignments = this.getDemoAssignments();
        }
        
        // Если все еще нет назначений, используем демо-данные
        if (assignments.length === 0) {
            console.log('Нет назначений, используем демо-данные');
            assignments = this.getDemoAssignments();
        }
        
        this.assignments = assignments;
        console.log('Итоговые назначения:', this.assignments);
        
        this.updateScheduleDisplay();
        this.updateSubjectSelector();
        
        // Автоматически загружаем студентов для текущего занятия
        setTimeout(() => {
            this.loadStudentsForCurrentLesson();
        }, 500);
        
    } catch (error) {
        console.error('Ошибка загрузки назначений:', error);
        this.assignments = this.getDemoAssignments();
        this.updateScheduleDisplay();
        this.updateSubjectSelector();
        
        setTimeout(() => {
            this.loadStudentsForCurrentLesson();
        }, 500);
    }
}
getRealGroupId(groupNumber) {
    if (!this.groups || !this.groups.length) return null;
    
    const group = this.groups.find(g => g.number === groupNumber);
    return group ? group.id : this.groups[0].id;
}
getCurrentInstructorId() {
    const user = this.currentUser;
    console.log('Текущий пользователь:', user);
    
    if (user && user.instructorId) {
        console.log('ID преподавателя из пользователя:', user.instructorId);
        return user.instructorId;
    }
    
    if (user && user.email) {
        const instructorId = this.getInstructorIdByEmail(user.email);
        console.log('ID преподавателя из email:', instructorId);
        return instructorId;
    }
    console.log('Используем fallback ID преподавателя');
    return '11111111-1111-1111-1111-111111111111';
}

getInstructorIdByEmail(email) {
    const instructorEmails = {
        'teacher1@edu.ru': '11111111-1111-1111-1111-111111111111',
        'teacher2@edu.ru': '22222222-2222-2222-2222-222222222222', 
        'prepod@edu.ru': '11111111-1111-1111-1111-111111111111',
        'prepod@mospolytech.ru': '11111111-1111-1111-1111-111111111111',
        'teacher@edu.ru': '11111111-1111-1111-1111-111111111111',
        'test@edu.ru': '11111111-1111-1111-1111-111111111111'
    };
    return instructorEmails[email.toLowerCase()] || '11111111-1111-1111-1111-111111111111';
}
renderInstructorAssignments() {
  const scheduleContainer = document.querySelector('.schedule-items');
  if (!scheduleContainer) return;
  if (this.assignments.length === 0) {
    scheduleContainer.innerHTML = `
      <div class="schedule-item">
        <div class="item-details">
          <div class="item-title">Нет назначенных предметов</div>
          <div class="item-teachers">Обратитесь к заведующему кафедрой</div>
        </div>
      </div>
    `;
    return;
  }
  scheduleContainer.innerHTML = this.assignments.map(assignment => `
    <div class="schedule-item ${this.isCurrentAssignment(assignment) ? 'current' : ''}">
      <div class="item-time">
        <span class="time-icon"></span>
        <span class="time-range">${assignment.start_time || '10:00'} - ${assignment.end_time || '11:30'}</span>
      </div>
      <div class="item-details">
        <div class="item-room">[${assignment.classroom || 'Ауд. не указана'}]</div>
        <div class="item-title">${assignment.subject_name || 'Предмет не указан'} (Лекция)</div>
        <div class="item-teachers">Группа: ${assignment.group_number || 'Не указана'}</div>
        <div class="item-dates">${assignment.assignment_date ? new Date(assignment.assignment_date).toLocaleDateString('ru-RU') : 'Дата не указана'}</div>
      </div>
      <button class="btn-mark-attendance" onclick="teacherApp.loadStudentsForAssignment('${assignment.id}')">
        Отметить посещаемость
      </button>
    </div>
  `).join('');
}
isCurrentAssignment(assignment) {
    if (!assignment.assignment_date) return false;
    const now = new Date();
    const assignmentDate = new Date(assignment.assignment_date);
    const isSameDate = assignmentDate.toDateString() === now.toDateString();
    console.log(`Проверка даты: ${assignmentDate.toDateString()} === ${now.toDateString()} : ${isSameDate}`);
    return isSameDate;
}
getDemoAssignments() {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Время для демо-занятия (ближайшее к текущему)
    const currentHour = today.getHours();
    let demoStartTime, demoEndTime;
    
    if (currentHour < 12) {
        demoStartTime = '10:00';
        demoEndTime = '11:30';
    } else if (currentHour < 14) {
        demoStartTime = '12:20';
        demoEndTime = '13:50';
    } else {
        demoStartTime = '14:00';
        demoEndTime = '15:30';
    }

    return [
        {
            id: 'demo-current',
            subject_id: '1',
            subject_name: 'Системы инженерного анализа',
            group_id: '0ed1e572-12ce-45f5-87a0-5e6ef8382e15', // 231-320
            group_number: '231-320',
            classroom: 'Пр/06',
            assignment_date: todayString,
            start_time: demoStartTime,
            end_time: demoEndTime
        }
    ];
}
showStudentsForToday() {
    this.filterStudentsByCurrentTime();
}
showStudentsForAllTime() {
    this.currentGroupId = 'all';
    this.currentSubjectId = 'all';
    this.renderStudents();
}
async loadAssignedStudents() {
    try {
        const students = await apiClient.getAllStudents();
        const groups = await apiClient.getAllGroups();
        console.log('ФИЛЬТРАЦИЯ СТУДЕНТОВ ПО НАЗНАЧЕНИЯМ ');
        console.log('Все студенты:', students?.length);
        console.log('Все группы:', groups?.length);
        console.log('Назначения преподавателя:', this.assignments);
        const assignedGroupIds = this.assignments.map(a => a.group_id).filter(id => id);
        console.log('ID назначенных групп:', assignedGroupIds);
        const allStudents = this.normalizeStudents(students || [], groups || []);
        console.log('Все нормализованные студенты:', allStudents.length);
        this.students = allStudents.filter(student => {
            const inAssignedGroup = assignedGroupIds.includes(student.groupId);
            console.log(`Студент ${student.surname} ${student.name}, группа ${student.groupId}, в назначенных: ${inAssignedGroup}`);
            return inAssignedGroup;
        });
        this.groups = (groups || []).filter(group => {
            const inAssignments = assignedGroupIds.includes(group.id);
            console.log(`Группа ${group.number}, ID: ${group.id}, в назначениях: ${inAssignments}`);
            return inAssignments;
        });
        console.log('Отфильтрованные студенты:', this.students.length);
        console.log('Отфильтрованные группы:', this.groups.length);
        this.populateGroupSelector();
        this.renderStudents();
        this.updateStats();
        
    } catch(error) {
        console.error('Ошибка загрузки назначенных студентов:', error);
        this.useDemoData();
    }
}
async loadAllStudents(){
try{
const students=await apiClient.getAllStudents();
const groups=await apiClient.getAllGroups();
const subjects=await apiClient.getAllSubjects();
this.students=this.normalizeStudents(students||[],groups||[]);
this.groups=groups||[];
this.subjects=subjects||[];
this.populateSubjectSelector();
this.populateGroupSelector();
this.renderStudents();
this.updateStats();
}catch(error){
console.error('Ошибка загрузки всех студентов:',error);
this.useDemoData();
}
}
normalizeStudents(students, groups) {
    if(!students || !Array.isArray(students)) {
        console.warn('Некорректные данные студентов:', students);
        return [];
    }
    return students.map(student => {
        const id = student.id || student.Id || this.generateTempId();
        const name = student.name || student.Name || '';
        const surname = student.surname || student.Surname || '';
        const patronymic = student.patronymic || student.Patronymic || '';
        let groupId = student.groupId || student.group_id || student.group?.id;
        let groupName = 'Не указана';
        if(groupId && groups && Array.isArray(groups)) {
            const foundGroup = groups.find(g => 
                g.id === groupId || 
                g.Id === groupId ||
                (g.number && student.groupName && g.number === student.groupName)
            );
            if(foundGroup) {
                groupName = foundGroup.number || foundGroup.name || 'Группа найдена';
                groupId = foundGroup.id || foundGroup.Id;
            }
        }
        return {
            id: id,
            name: name,
            surname: surname,
            patronymic: patronymic,
            fullName: `${surname} ${name} ${patronymic}`.trim(),
            groupId: groupId,
            groupName: groupName,
            present: false
        };
    });
}
populateSubjectSelector(){
    const select = document.getElementById('subject-select');
    if(!select) return;
    let availableSubjects = [];
    if (this.assignments && this.assignments.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const todaysAssignments = this.assignments.filter(assignment => 
            assignment.assignment_date && 
            assignment.assignment_date.split('T')[0] === today
        );
        availableSubjects = todaysAssignments.filter((assignment, index, self) =>
            index === self.findIndex(a => a.subject_id === assignment.subject_id)
        );
    }
    select.innerHTML = `
        <option value="all">Все предметы на сегодня</option>
        ${availableSubjects.map(assignment => 
            `<option value="${assignment.subject_id}">${assignment.subject_name || 'Предмет'}</option>`
        ).join('')}
        <option value="all_time">Все предметы (все время)</option>
    `;
    console.log('Загружено предметов на сегодня:', availableSubjects.length);
}
async loadStudentsForAssignment(assignmentId) {
    console.log('Загрузка студентов для назначения:', assignmentId);
    const assignment = this.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
        alert('Назначение не найдено');
        return;
    }
    this.currentGroupId = assignment.group_id;
    console.log('Установлена текущая группа:', this.currentGroupId);
    const groupSelect = document.getElementById('group-select');
    if (groupSelect) {
        groupSelect.value = assignment.group_id;
        console.log('Селектор групп обновлен на:', assignment.group_id);
    }
    this.renderStudents();
    alert(`Загружены студенты группы ${assignment.group_number} для предмета "${assignment.subject_name}"`);
}
populateGroupSelector() {
    const mainSelect = document.getElementById('group-select');
    if(!mainSelect) {
        console.error('Элемент group-select не найден');
        return;
    }
    let availableGroups = this.groups;
    if (this.currentSubjectId && this.currentSubjectId !== 'all') {
        const today = new Date().toISOString().split('T')[0];
        const subjectGroups = this.assignments
            .filter(assignment => 
                assignment.subject_id == this.currentSubjectId &&
                assignment.assignment_date &&
                assignment.assignment_date.split('T')[0] === today
            )
            .map(assignment => assignment.group_id);
        availableGroups = this.groups.filter(group => 
            subjectGroups.includes(group.id)
        );
    }
    mainSelect.innerHTML = `
        <option value="all">Все группы</option>
        ${availableGroups.map(group => 
            `<option value="${group.id}">${group.number}</option>`
        ).join('')}
    `;
    
    console.log(`Загружено групп для преподавателя: ${availableGroups.length}`);
}
updateSubjectSelector() {
    const subjectSelect = document.getElementById('subject-select');
    if (!subjectSelect) {
        console.error('subject-select не найден!');
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    const todayAssignments = this.assignments.filter(assignment => 
        assignment.assignment_date && 
        assignment.assignment_date.split('T')[0] === today
    );
    const uniqueSubjects = todayAssignments.filter((assignment, index, self) =>
        index === self.findIndex(a => a.subject_id === assignment.subject_id)
    );
    console.log('Сегодняшние предметы для селектора:', uniqueSubjects);
    subjectSelect.innerHTML = `
        <option value="all">Все предметы на сегодня</option>
        ${uniqueSubjects.map(assignment => 
            `<option value="${assignment.subject_id}">${assignment.subject_name || 'Предмет'}</option>`
        ).join('')}
        <option value="all_time">Все предметы (все время)</option>
    `;
    subjectSelect.onchange = (e) => {
        this.currentSubjectId = e.target.value;
        console.log('Выбран предмет:', this.currentSubjectId);
        this.renderStudents();
    };
}
renderStudents() {
    const container = document.getElementById('students-list');
    if (!container) {
        console.error('Контейнер students-list не найден!');
        return;
    }
    
    console.log('=== РЕНДЕРИНГ СТУДЕНТОВ ===');
    console.log('Всего студентов доступно:', this.students.length);
    console.log('Текущий предмет ID:', this.currentSubjectId);
    console.log('Текущая группа ID:', this.currentGroupId);

    let studentsToShow = [...this.students];

    // Фильтрация по группе (если выбрана конкретная группа)
    if (this.currentGroupId && this.currentGroupId !== 'all') {
        console.log('Фильтруем по группе:', this.currentGroupId);
        const beforeFilter = studentsToShow.length;
        studentsToShow = studentsToShow.filter(student => {
            const inGroup = student.groupId === this.currentGroupId;
            console.log(`Студент ${student.surname} ${student.name}, группа ${student.groupId}, в выбранной: ${inGroup}`);
            return inGroup;
        });
        console.log(`После фильтрации по группе: ${beforeFilter} -> ${studentsToShow.length}`);
    }

    // Фильтрация по предмету (если выбран конкретный предмет)
    if (this.currentSubjectId && this.currentSubjectId !== 'all') {
        console.log('Фильтруем по предмету:', this.currentSubjectId);
        
        // Находим группы, которые имеют этот предмет
        const subjectGroups = this.assignments
            .filter(assignment => assignment.subject_id == this.currentSubjectId)
            .map(assignment => assignment.group_id);
            
        console.log('Группы с выбранным предметом:', subjectGroups);
        
        const beforeFilter = studentsToShow.length;
        studentsToShow = studentsToShow.filter(student => {
            const inSubjectGroup = subjectGroups.includes(student.groupId);
            console.log(`Студент ${student.surname} группа ${student.groupId} в предметных группах: ${inSubjectGroup}`);
            return inSubjectGroup;
        });
        console.log(`После фильтрации по предмету: ${beforeFilter} -> ${studentsToShow.length}`);
    }

    console.log('Итоговое количество студентов для отображения:', studentsToShow.length);

    if (studentsToShow.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <h4>Нет студентов для отображения</h4>
                <p>Попробуйте изменить фильтры или проверить назначения</p>
                <button class="btn-primary" onclick="teacherApp.showAllStudents()" 
                        style="margin-top:10px;">
                    Показать всех студентов
                </button>
            </div>
        `;
        return;
    }
    container.innerHTML = studentsToShow.map(student => `
        <div class="student-item">
            <div class="student-info">
                <div class="student-name">${student.surname} ${student.name} ${student.patronymic || ''}</div>
                <div class="student-group">Группа: ${student.groupName}</div>
            </div>
            <div class="attendance-toggle">
                <input type="checkbox" id="student-${student.id}" 
                    ${student.present ? 'checked' : ''}
                    onchange="teacherApp.toggleStudent('${student.id}', this.checked)">
                <label for="student-${student.id}">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `).join('');
    
    this.updateStats();
}
updateScheduleDisplay() {
    const scheduleContainer = document.querySelector('.schedule-items');
    if (!scheduleContainer) {
        console.error('Контейнер расписания не найден');
        return;
    }
    console.log('Обновление расписания, назначений:', this.assignments.length);
    if (this.assignments.length === 0) {
        scheduleContainer.innerHTML = `
            <div class="schedule-item">
                <div class="item-details">
                    <div class="item-title">Нет назначенных предметов</div>
                    <div class="item-teachers">Обратитесь к заведующему кафедрой</div>
                </div>
            </div>
        `;
        return;
    }
    const sortedAssignments = [...this.assignments].sort((a, b) => {
        const timeA = a.start_time || '00:00';
        const timeB = b.start_time || '00:00';
        return timeA.localeCompare(timeB);
    });
    scheduleContainer.innerHTML = sortedAssignments.map(assignment => {
        const isCurrent = this.isCurrentAssignment(assignment);
        console.log(`Назначение ${assignment.subject_name}, текущее: ${isCurrent}`);
        return `
            <div class="schedule-item ${isCurrent ? 'current' : ''}">
                <div class="item-time">
                    <span class="time-icon"></span>
                    <span class="time-range">${assignment.start_time || '10:00'} - ${assignment.end_time || '11:30'}</span>
                </div>
                <div class="item-details">
                    <div class="item-room">[${assignment.classroom || 'Ауд. не указана'}]</div>
                    <div class="item-title">${assignment.subject_name || 'Предмет не указан'} (Лекция)</div>
                    <div class="item-teachers">Группа: ${assignment.group_number || 'Не указана'}</div>
                    <div class="item-dates">${assignment.assignment_date ? new Date(assignment.assignment_date).toLocaleDateString('ru-RU') : 'Дата не указана'}</div>
                </div>
                <button class="btn-mark-attendance" onclick="teacherApp.loadStudentsForAssignment('${assignment.id}')">
                    Отметить посещаемость
                </button>
            </div>
        `;
    }).join('');
    console.log('Расписание обновлено');
}
toggleStudent(studentId,isPresent){
const student=this.students.find(s=>s.id===studentId);
if(student){
student.present=isPresent;
this.updateStats();
}
}
updateStats(){
const presentCount=this.students.filter(s=>s.present).length;
const totalCount=this.students.length;
const presentElement=document.getElementById('present-count');
const totalElement=document.getElementById('total-count');
if(presentElement)presentElement.textContent=presentCount;
if(totalElement)totalElement.textContent=totalCount;
}
async saveAttendance() {
    try {
        console.log('=== СОХРАНЕНИЕ ПОСЕЩАЕМОСТИ ===');
        const groupSelect = document.getElementById('group-select');
        const subjectSelect = document.getElementById('subject-select');
        const currentGroupId = this.currentGroupId;
        const currentSubjectId = this.currentSubjectId;
        console.log('Текущие фильтры:', {
            группа: currentGroupId,
            предмет: currentSubjectId
        });
        let studentsToSave = [...this.students];
        
        if (currentGroupId && currentGroupId !== 'all') {
            studentsToSave = studentsToSave.filter(student => student.groupId === currentGroupId);
            console.log(`Фильтрация по группе: ${this.students.length} -> ${studentsToSave.length}`);
        }
        if (currentSubjectId && currentSubjectId !== 'all') {
            const subjectGroups = this.assignments
                .filter(assignment => assignment.subject_id == currentSubjectId)
                .map(assignment => assignment.group_id);
            
            studentsToSave = studentsToSave.filter(student => 
                subjectGroups.includes(student.groupId)
            );
            console.log(`Фильтрация по предмету: ${studentsToSave.length} студентов`);
        }
        const presentStudents = studentsToSave.filter(s => s.present);
        const absentStudents = studentsToSave.filter(s => !s.present);
        
        console.log('Студенты для сохранения:', {
            всего: studentsToSave.length,
            присутствуют: presentStudents.length,
            отсутствуют: absentStudents.length
        });
        if (studentsToSave.length === 0) {
            alert('Нет студентов для сохранения. Проверьте фильтры.');
            return;
        }
        let currentAssignment = null;
        if (currentSubjectId && currentSubjectId !== 'all' && currentGroupId && currentGroupId !== 'all') {
            currentAssignment = this.assignments.find(assignment => 
                assignment.subject_id == currentSubjectId && 
                assignment.group_id === currentGroupId
            );
        }
        const subjectName = currentAssignment ? 
            currentAssignment.subject_name : 
            (subjectSelect ? subjectSelect.options[subjectSelect.selectedIndex].text : 'Неизвестный предмет');
        const groupName = currentAssignment ? 
            currentAssignment.group_number : 
            (groupSelect ? groupSelect.options[groupSelect.selectedIndex].text : 'Неизвестная группа');
        const attendanceData = {
            date: new Date().toISOString(),
            subject: subjectName,
            group: groupName,
            subject_id: currentSubjectId,
            group_id: currentGroupId,
            presentStudents: presentStudents.map(s => ({
                id: s.id,
                name: s.name,
                surname: s.surname,
                patronymic: s.patronymic,
                groupName: s.groupName,
                groupId: s.groupId
            })),
            absentStudents: absentStudents.map(s => ({
                id: s.id,
                name: s.name,
                surname: s.surname,
                patronymic: s.patronymic,
                groupName: s.groupName,
                groupId: s.groupId
            })),
            presentCount: presentStudents.length,
            totalCount: studentsToSave.length,
            assignment_id: currentAssignment ? currentAssignment.id : null
        };
        console.log('Данные для сохранения:', attendanceData);
        const response = await fetch('http://localhost:5000/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendanceData)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.success) {
            alert(`Посещаемость сохранена!\n${subjectName} - ${groupName}\nПрисутствуют: ${presentStudents.length}/${studentsToSave.length}`);
            studentsToSave.forEach(student => student.present = false);
            this.renderStudents();
            this.updateStats();
            
        } else {
            throw new Error(result.error || 'Неизвестная ошибка сервера');
        }
    } catch (error) {
        console.error('Ошибка при сохранении посещаемости:', error);
        alert('Ошибка при сохранении посещаемости: ' + error.message);
    }
}
getCurrentSubject(){
if(this.currentSubjectId&&this.currentSubjectId!=='all'){
const subject=this.subjects.find(s=>s.id==this.currentSubjectId);
return subject?subject.name:'Неизвестный предмет';
}
return'Неизвестный предмет';
}
getCurrentGroupName(){
if(this.currentGroupId==='all'){
return'Все группы';
}
const group=this.groups.find(g=>g.id===this.currentGroupId);
return group?group.number:'Неизвестная группа';
}
setupEventListeners(){
    const groupSelect = document.getElementById('group-select');
    const subjectSelect = document.getElementById('subject-select');
    if(groupSelect){
        groupSelect.addEventListener('change', (e) => {
            this.currentGroupId = e.target.value;
            this.renderStudents();
        });
    }
    if(subjectSelect){
        subjectSelect.addEventListener('change', (e) => {
            this.currentSubjectId = e.target.value;
            if (this.currentSubjectId === 'all_time') {
                this.currentSubjectId = 'all';
            }
            if (this.currentUser.role !== 'admin') {
                this.populateGroupSelector();
            }
            this.renderStudents();
        });
    } 
    const logoutBtn = document.querySelector('.btn-logout');
    if(logoutBtn){
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = 'form.html';
        });
    }    
    const saveBtn = document.getElementById('save-attendance-btn');
    if(saveBtn){
        console.log('Кнопка сохранения найдена, добавляем обработчик');
        saveBtn.addEventListener('click', () => {
            console.log('Кнопка сохранения нажата');
            this.saveAttendance();
        });
    } else {
        console.error('Кнопка save-attendance-btn не найдена!');
    }
}
async loadStudentsForAttendance(){
console.log('Загрузка студентов для текущего занятия');
await this.loadTeacherData();
alert(`Студенты загружены:${this.students.length}человек`);
}
displayCurrentDate(){
const now=new Date();
const dateElement=document.getElementById('current-date');
if(dateElement){
dateElement.textContent=now.toLocaleDateString('ru-RU',{
weekday:'long',
year:'numeric',
month:'long',
day:'numeric'
});
}
}
useDemoData(){
console.log('Используем демо-данные...');
this.students=[
{
id:'1',
name:'Иван',
surname:'Иванов',
patronymic:'Иванович',
fullName:'Иванов Иван Иванович',
groupId:'1',
groupName:'231-324',
present:false
},
{
id:'2',
name:'Мария',
surname:'Петрова',
patronymic:'Сергеевна',
fullName:'Петрова Мария Сергеевна',
groupId:'1',
groupName:'231-324',
present:false
}
];
this.groups=[
{id:'1',number:'231-324'},
{id:'2',number:'231-325'}
];
this.assignments=[
{
instructor_id:'1',
subject_id:'1',
group_id:'1',
subject_name:'Системы инженерного анализа',
group_number:'231-324',
instructorName:this.currentUser.name||'Преподаватель'
}
];
this.populateGroupSelector();
this.populateSubjectSelector();
this.renderStudents();
this.updateStats();
}
generateTempId(){
return'temp_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);
}
}
function generateQRCode(lessonId) {
    window.open(`/qr-generator.html?lesson=${lessonId}`, '_blank');
}

const teacherApp=new TeacherApp();
window.teacherApp=teacherApp;