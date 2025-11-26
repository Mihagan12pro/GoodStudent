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
this.setupEventListeners();
this.displayCurrentDate();
this.setupAttendanceButton();
}
async loadTeacherData(){
try{
console.log('Загружаем данные преподавателя...');
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
const allAssignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
const userName=this.currentUser.name.toLowerCase();
this.assignments=allAssignments.filter(assignment=>{
const instructorName=assignment.instructorName.toLowerCase();
return instructorName.includes(userName);
});
console.log('Назначения преподавателя:',this.assignments);
this.populateSubjectSelector();
}catch(error){
console.error('Ошибка загрузки назначений:',error);
this.assignments=[];
}
}
async loadAssignedStudents(){
try{
const students=await apiClient.getAllStudents();
const groups=await apiClient.getAllGroups();
const assignedGroupIds=this.assignments.map(a=>a.groupId);
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
const select=document.getElementById('subject-select');
if(!select)return;
select.innerHTML='<option value="all">Все предметы</option>';
const assignedSubjects=this.assignments.map(assignment=>({
id:assignment.subjectId,
name:assignment.subjectName
}));
const uniqueSubjects=assignedSubjects.filter((subject,index,self)=>
index===self.findIndex(s=>s.id===subject.id)
);
uniqueSubjects.forEach(subject=>{
const option=document.createElement('option');
option.value=subject.id;
option.textContent=subject.name;
select.appendChild(option);
});
console.log('Загружено предметов:',uniqueSubjects.length);
}
populateGroupSelector(){
const select=document.getElementById('group-select');
if(!select){
console.error('Элемент group-select не найден');
return;
}
select.innerHTML='<option value="all">Все группы</option>';
const assignedGroups=this.assignments.map(a=>a.groupId);
const uniqueGroupIds=[...new Set(assignedGroups)];
uniqueGroupIds.forEach(groupId=>{
const group=this.groups.find(g=>g.id===groupId);
if(group){
const option=document.createElement('option');
option.value=group.id;
option.textContent=group.number;
select.appendChild(option);
}
});
if(uniqueGroupIds.length===0){
this.groups.forEach(group=>{
const option=document.createElement('option');
option.value=group.id;
option.textContent=group.number;
select.appendChild(option);
});
}
console.log(`Загружено групп:${select.options.length-1}`);
}
renderStudents(){
const container=document.getElementById('students-list');
if(!container)return;
console.log('Рендерим студентов для преподавателя');
if(this.students.length===0){
container.innerHTML=`
<div style="text-align:center;padding:40px;color:#666;">
<h4>Нет студентов для отображения</h4>
<p>Вам не назначены предметы или нет студентов в назначенных группах</p>
</div>
`;
return;
}
let filteredStudents=this.students;
if(this.currentGroupId&&this.currentGroupId!=='all'){
filteredStudents=filteredStudents.filter(student=>
student.groupId===this.currentGroupId
);
}
if(this.currentSubjectId&&this.currentSubjectId!=='all'){
const assignmentsForSubject=this.assignments.filter(a=>a.subjectId==this.currentSubjectId);
const groupIdsForSubject=assignmentsForSubject.map(a=>a.groupId);
filteredStudents=filteredStudents.filter(student=>
groupIdsForSubject.includes(student.groupId)
);
}
container.innerHTML=filteredStudents.map(student=>`
<div class="student-item">
<div class="student-info">
<div class="student-name">${student.surname}${student.name}${student.patronymic||''}</div>
<div class="student-group">Группа:${student.groupName}</div>
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
try{
const result=await apiClient.markAttendance({
date:new Date().toISOString(),
subject:this.getCurrentSubject(),
group:this.getCurrentGroupName(),
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
const groupSelect=document.getElementById('group-select');
if(groupSelect){
groupSelect.addEventListener('change',(e)=>{
this.currentGroupId=e.target.value;
this.renderStudents();
});
}
const subjectSelect=document.getElementById('subject-select');
if(subjectSelect){
subjectSelect.addEventListener('change',(e)=>{
this.currentSubjectId=e.target.value;
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
setupAttendanceButton(){
const saveButton=document.getElementById('save-attendance-btn');
if(saveButton){
saveButton.addEventListener('click',()=>this.saveAttendance());
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
instructorId:'1',
subjectId:'1',
groupId:'1',
subjectName:'Системы инженерного анализа',
groupName:'231-324',
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