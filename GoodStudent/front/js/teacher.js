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
renderCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById('current-month').textContent = 
        `${monthNames[this.currentMonth]} ${this.currentYear}`;
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const monthAssignments = this.getAssignmentsForMonth(this.currentMonth, this.currentYear);
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
        
        const isToday = date.toDateString() === today.toDateString();
        const hasClass = monthAssignments.some(assignment => 
            assignment.assignment_date && 
            assignment.assignment_date.split('T')[0] === dateString
        );
        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (hasClass) dayClass += ' has-class';
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
        return assignmentDate.getMonth() === month && 
               assignmentDate.getFullYear() === year;
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
    const dayAssignments = this.assignments.filter(assignment => 
        assignment.assignment_date && 
        assignment.assignment_date.split('T')[0] === date
    );
    if (dayAssignments.length === 0) {
        alert(`На ${new Date(date).toLocaleDateString('ru-RU')} нет занятий`);
        return;
    }
    const scheduleText = dayAssignments.map(assignment => 
        `${assignment.start_time || '--:--'} - ${assignment.subject_name} (${assignment.group_number})`
    ).join('\n');
    
    alert(`Занятия на ${new Date(date).toLocaleDateString('ru-RU')}:\n\n${scheduleText}`);
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
async init() {
    console.log('Инициализация приложения преподавателя');
    await this.loadTeacherData();
    await this.loadInstructorAssignments();
    this.setupEventListeners();
    this.setupGroupSelectorsSync();
    this.displayCurrentDate();
    this.initCalendar();
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
        console.log('ID преподавателя для загрузки назначений:', instructorId);
        if (!instructorId) {
            console.log('ID преподавателя не найден, используем демо-данные');
            this.assignments = this.getDemoAssignments();
            this.updateScheduleDisplay();
            this.updateSubjectSelector(); 
            return;
        }
        const response = await fetch(`http://localhost:5000/api/instructors/${instructorId}/assignments`);
        if (response.ok) {
            const assignments = await response.json();
            console.log('Назначения преподавателя загружены:', assignments);
            
            this.assignments = assignments.map(assignment => ({
                ...assignment,
                group_id: assignment.group_id || this.getRealGroupId(assignment.group_number)
            }));
        } else {
            console.log('Не удалось загрузить назначения, используем демо-данные с реальными ID');
            this.assignments = this.getDemoAssignments();
        }
        this.updateScheduleDisplay();
        this.updateSubjectSelector(); 
    } catch (error) {
        console.error('Ошибка загрузки назначений:', error);
        this.assignments = this.getDemoAssignments();
        this.updateScheduleDisplay();
        this.updateSubjectSelector(); 
    }
}
getRealGroupId(groupNumber) {
    if (!this.groups || !this.groups.length) return null;
    
    const group = this.groups.find(g => g.number === groupNumber);
    return group ? group.id : this.groups[0].id;
}
getCurrentInstructorId(){
    const user = this.currentUser;
    if (user && user.email) {
        if (user.instructorId) {
            return user.instructorId;
        }
        if (this.instructors && Array.isArray(this.instructors)) {
            const instructor = this.instructors.find(inst => 
                inst.email === user.email || 
                `${inst.surname} ${inst.name}`.toLowerCase().includes(user.name.toLowerCase())
            );
            return instructor ? instructor.id : null;
        }
    }
    return null;
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
    const realGroupIds = this.groups && this.groups.length > 0 
        ? this.groups.map(g => g.id)
        : ['b8f78604-7d47-4eb0-9389-6b8eaaa1653b', '137b8ecb-402d-41fe-979d-3bb5fd02e7c2'];
    const realGroupNumbers = this.groups && this.groups.length > 0
        ? this.groups.map(g => g.number)
        : ['231-324', '231-325'];
    return [
        {
            id: 'demo-1',
            subject_name: 'Системы инженерного анализа',
            group_id: realGroupIds[0], 
            group_number: realGroupNumbers[0], 
            classroom: 'Пр/06',
            assignment_date: new Date().toISOString(),
            start_time: '12:20',
            end_time: '13:50'
        },
        {
            id: 'demo-2', 
            subject_name: 'Базы данных',
            group_id: realGroupIds[1] || realGroupIds[0], 
            group_number: realGroupNumbers[1] || realGroupNumbers[0],
            classroom: 'Пр/01',
            assignment_date: new Date(Date.now() + 86400000).toISOString(),
            start_time: '14:00',
            end_time: '15:30'
        }
    ];
}
async loadAssignedStudents() {
    try {
        console.log('Все студенты:', this.students.length);
        console.log('Все группы:', this.groups.length);
        console.log('Назначения преподавателя:', this.assignments);
        const assignedGroupIds = this.assignments.map(a => a.group_id).filter(id => id);
        console.log('ID назначенных групп:', assignedGroupIds);
        if (assignedGroupIds.length === 0) {
            console.log('Нет назначенных групп, показываем всех студентов');
            this.populateGroupSelector();
            this.renderStudents();
            this.updateStats();
            return;
        }
        const filteredStudents = this.students.filter(student => {
            const inAssignedGroup = assignedGroupIds.includes(student.groupId);
            console.log(`Студент ${student.surname} ${student.name}, группа ${student.groupId}, в назначенных: ${inAssignedGroup}`);
            return inAssignedGroup;
        });
        const filteredGroups = this.groups.filter(group => {
            const inAssignments = assignedGroupIds.includes(group.id);
            console.log(`Группа ${group.number}, ID: ${group.id}, в назначениях: ${inAssignments}`);
            return inAssignments;
        });
        console.log('Отфильтрованные студенты:', filteredStudents.length);
        console.log('Отфильтрованные группы:', filteredGroups.length);
        this.students = filteredStudents;
        this.groups = filteredGroups;
        this.populateGroupSelector();
        this.renderStudents();
        this.updateStats();
    } catch(error) {
        console.error('Ошибка загрузки назначенных студентов:', error);
        this.populateGroupSelector();
        this.renderStudents();
        this.updateStats();
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
    const availableGroups = this.groups.map(group => ({
        group_id: group.id,
        group_number: group.number
    }));
    mainSelect.innerHTML = `
        <option value="all">Все мои группы</option>
        ${availableGroups.map(item => 
            `<option value="${item.group_id}">${item.group_number}</option>`
        ).join('')}
    `;
    console.log(`Загружено групп для преподавателя: ${availableGroups.length}`);
}
updateSubjectSelector() {
    const subjectSelect = document.getElementById('subject-select');
    if (!subjectSelect) return;
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
    subjectSelect.addEventListener('change', (e) => {
        this.currentSubjectId = e.target.value;
        if (this.currentSubjectId === 'all_time') {
            this.currentSubjectId = 'all';
        }
        this.renderStudents();
    });
}
renderStudents() {
    const container = document.getElementById('students-list');
    if(!container) return;
    console.log('Рендерим студентов для преподавателя:', {
        группа: this.currentGroupId,
        предмет: this.currentSubjectId,
        всего_студентов: this.students.length
    });
    let studentsToShow = this.students;
    if (this.currentSubjectId && this.currentSubjectId !== 'all') {
        console.log('Фильтруем по предмету:', this.currentSubjectId);
        const today = new Date().toISOString().split('T')[0];
        const subjectGroups = this.assignments
            .filter(assignment => 
                assignment.subject_id == this.currentSubjectId &&
                assignment.assignment_date &&
                assignment.assignment_date.split('T')[0] === today
            )
            .map(assignment => assignment.group_id);
        console.log('Группы с выбранным предметом:', subjectGroups);
        studentsToShow = studentsToShow.filter(student => 
            subjectGroups.includes(student.groupId)
        );
        console.log('После фильтрации по предмету:', studentsToShow.length);
    }
    if(this.currentGroupId && this.currentGroupId !== 'all') {
        console.log('Фильтруем по группе:', this.currentGroupId);
        studentsToShow = studentsToShow.filter(student => 
            student.groupId === this.currentGroupId
        );
        console.log('После фильтрации по группе:', studentsToShow.length);
    }
    if (studentsToShow.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <h4>Нет студентов для отображения</h4>
                <p>Попробуйте изменить фильтры или загрузить студентов через панель администратора</p>
                <button class="btn-primary" onclick="location.href='/admin-dashboard.html'" style="margin-top:10px;">
                    Перейти в панель администратора
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
async saveAttendance(){
const presentStudents=this.students.filter(s=>s.present);
const currentSubject=this.subjects.find(s=>s.id==this.currentSubjectId);
const currentGroup=this.groups.find(g=>g.id===this.currentGroupId);
try{
const result=await apiClient.markAttendance({
date:new Date().toISOString(),
subject:currentSubject?currentSubject.name:this.getCurrentSubject(),
group:currentGroup?currentGroup.number:this.getCurrentGroupName(),
presentStudents:presentStudents,
presentCount:presentStudents.length,
totalCount:this.students.length
});
alert(`Посещаемость сохранена:${presentStudents.length}из${this.students.length}студентов`);
}catch(error){
alert('Ошибка при сохранении посещаемости');
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
        groupSelect.addEventListener('change',(e)=>{
            this.currentGroupId = e.target.value;
            this.renderStudents();
        });
    }
    if(subjectSelect){
        subjectSelect.addEventListener('change',(e)=>{
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
    const logoutBtn=document.querySelector('.btn-logout');
    if(logoutBtn){
        logoutBtn.addEventListener('click',()=>{
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href='form.html';
        });
    }    
    const saveBtn=document.getElementById('save-attendance-btn');
    if(saveBtn){
        saveBtn.addEventListener('click',()=>this.saveAttendance());
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
const teacherApp=new TeacherApp();
window.teacherApp=teacherApp;