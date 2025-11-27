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
this.init();
}
async init(){
  console.log('Инициализация приложения преподавателя');
  await this.loadTeacherData();
  await this.loadInstructorAssignments();
  this.setupEventListeners();
  this.setupGroupSelectorsSync();
  this.displayCurrentDate();
  this.setupAttendanceButton();
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
async loadTeacherData(){
    try{
        console.log('Загружаем данные преподавателя...');
        this.instructors = await apiClient.getAllInstructors();
        console.log('Преподаватели загружены:', this.instructors);        
        await this.loadAssignments();
        if(this.assignments.length>0){
            await this.loadAssignedStudents();
        }else{
            await this.loadAllStudents();
        }
    }catch(error){
        console.error('Ошибка загрузки данных:',error);
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
    if (!instructorId) {
      console.log('ID преподавателя не найден, используем демо-данные');
      return this.getDemoAssignments();
    }
    const response = await fetch(`http://localhost:5000/api/instructors/${instructorId}/assignments`);
    if (response.ok) {
      this.assignments = await response.json();
      console.log('Назначения преподавателя загружены:', this.assignments);
      this.renderInstructorAssignments();
    } else {
      console.log('Не удалось загрузить назначения, используем демо-данные');
      this.assignments = this.getDemoAssignments();
      this.renderInstructorAssignments();
    }
  } catch (error) {
    console.error('Ошибка загрузки назначений:', error);
    this.assignments = this.getDemoAssignments();
    this.renderInstructorAssignments();
  }
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
  const now = new Date();
  const assignmentDate = new Date(assignment.assignment_date);
  return assignmentDate.toDateString() === now.toDateString();
}
getDemoAssignments() {
  return [
    {
      id: 'demo-1',
      subject_name: 'Системы инженерного анализа',
      group_number: '231-324',
      classroom: 'Пр/06',
      assignment_date: new Date().toISOString(),
      start_time: '12:20',
      end_time: '13:50'
    },
    {
      id: 'demo-2', 
      subject_name: 'Базы данных',
      group_number: '231-325',
      classroom: 'Пр/01',
      assignment_date: new Date(Date.now() + 86400000).toISOString(),
      start_time: '14:00',
      end_time: '15:30'
    }
  ];
}
async loadAssignedStudents(){
try{
const students=await apiClient.getAllStudents();
const groups=await apiClient.getAllGroups();
const assignedGroupIds=this.assignments.map(a=>a.group_id);
this.students=this.normalizeStudents(students||[],groups||[])
.filter(student=>assignedGroupIds.includes(student.groupId));
this.groups=groups||[];
this.subjects=await apiClient.getAllSubjects();
this.populateGroupSelector();
this.renderStudents();
this.updateStats();
}catch(error){
console.error('Ошибка загрузки назначенных студентов:',error);
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
normalizeStudents(students,groups){
if(!students||!Array.isArray(students)){
console.warn('Некорректные данные студентов:',students);
return[];
}
return students.map(student=>{
const id=student.id||student.Id||this.generateTempId();
const name=student.name||student.Name||'';
const surname=student.surname||student.Surname||'';
const patronymic=student.patronymic||student.Patronymic||'';
let groupId=student.groupId||student.group_id||student.group?.id;
let groupName='Не указана';
if(groupId){
const foundGroup=groups.find(g=>g.id===groupId||g.Id===groupId);
if(foundGroup){
groupName=foundGroup.number||foundGroup.name||'Группа найдена';
}
}
return{
id:id,
name:name,
surname:surname,
patronymic:patronymic,
fullName:`${surname}${name}${patronymic}`.trim(),
groupId:groupId,
groupName:groupName,
present:false
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
    const groupSelect = document.getElementById('group-select');
    if (groupSelect) {
        groupSelect.value = assignment.group_id;
    }
    await this.loadAssignedStudents();
    alert(`Загружены студенты группы ${assignment.group_number} для предмета "${assignment.subject_name}"`);
}
populateGroupSelector(){
    const mainSelect = document.getElementById('group-select');
    if(!mainSelect){
        console.error('Элемент group-select не найден');
        return;
    }
    const isAdmin = this.currentUser.role === 'admin';
    console.log('Роль пользователя:', this.currentUser.role, 'isAdmin:', isAdmin);
    let availableGroups = [];
    if (isAdmin) {
        availableGroups = this.groups.map(group => ({
            group_id: group.id,
            group_number: group.number
        }));
    } else {
        if (this.currentSubjectId && this.currentSubjectId !== 'all' && this.currentSubjectId !== 'all_time') {
            availableGroups = this.assignments.filter(assignment => 
                assignment.subject_id == this.currentSubjectId
            );
            console.log('Фильтр по предмету:', this.currentSubjectId, 'групп:', availableGroups.length);
        } else {
            availableGroups = this.assignments && this.assignments.length > 0 ? 
                this.assignments : 
                [];
        }
    }
    mainSelect.innerHTML = `
        <option value="all">Все группы</option>
        ${availableGroups.map(item => 
            `<option value="${item.group_id}">${item.group_number}</option>`
        ).join('')}
    `;
    
    console.log(`Загружено групп для селектора: ${availableGroups.length}`);
}
renderStudents(){
    const container = document.getElementById('students-list');
    if(!container) return;
    console.log('Рендерим студентов для преподавателя, текущая группа:', this.currentGroupId);
    if(this.students.length === 0){
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <h4>Нет студентов для отображения</h4>
                <p>Вам не назначены предметы или нет студентов в назначенных группах</p>
            </div>
        `;
        return;
    }
    let filteredStudents = this.students;
    if(this.currentGroupId && this.currentGroupId !== 'all'){
        console.log('Фильтруем по группе:', this.currentGroupId);
        filteredStudents = filteredStudents.filter(student => {
            const match = student.groupId === this.currentGroupId;
            console.log(`Студент ${student.surname} ${student.name}, группа: ${student.groupId}, совпадение: ${match}`);
            return match;
        });
    }
    console.log('После фильтрации осталось студентов:', filteredStudents.length);
    container.innerHTML = filteredStudents.map(student => `
        <div class="student-item">
            <div class="student-info">
                <div class="student-name">${student.surname} ${student.name} ${student.patronymic || ''}</div>
                <div class="student-group">Группа: ${student.groupName}</div>
            </div>
            <div class="attendance-toggle">
                <input type="checkbox" id="student-${student.id}" onchange="teacherApp.toggleStudent('${student.id}',this.checked)">
                <label for="student-${student.id}">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `).join('');
    this.updateStats();
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