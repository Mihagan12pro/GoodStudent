class AdminApp{
constructor(){
if(!localStorage.getItem('authToken')){
window.location.href='/form.html';
return;
}
this.currentUser=JSON.parse(localStorage.getItem('user')||'{}');
this.uploadedData=null;
this.departments=[];
this.instructors=[];
this.subjects=[];
this.groups=[];
this.assignments=[];
this.init();
}
async init(){
this.setupEventListeners();
this.displayCurrentDate();
await this.loadAdminData();
await this.loadAssignments();
}
async loadAdminData(){
try{
console.log('Загружаем данные для админки');
const[groups,instructors,departments,subjects]=await Promise.all([
apiClient.getAllGroups(),
apiClient.getAllInstructors(),
apiClient.getAllDepartments(),
apiClient.getAllSubjects()
]);
this.groups=groups||[];
this.instructors=instructors||[];
this.departments=departments||[];
this.subjects=subjects||[];
console.log('Данные загружены:',this.groups.length,'групп',this.instructors.length,'преподавателей',this.departments.length,'кафедр');
this.populateGroupSelectors();
this.populateInstructorSelector();
this.populateDepartmentSelector();
this.populateSubjectSelector();
this.updateStats();
}catch(error){
console.error('Ошибка загрузки данных админки:',error);
this.useDemoData();
}
}
async loadAssignments(){
try{
const allAssignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
this.assignments=allAssignments;
this.displayAssignments();
}catch(error){
console.error('Ошибка загрузки назначений:',error);
}
}
async assignSubjectToInstructor(){
const instructorId=document.getElementById('instructor-select').value;
const subjectId=document.getElementById('subject-assign-select').value;
const groupId=document.getElementById('group-assign-select').value;
const departmentId=document.getElementById('department-select').value;
if(!instructorId||!subjectId||!groupId||!departmentId){
alert('Заполните все поля');
return;
}
try{
const instructor=this.instructors.find(i=>i.id===instructorId);
const subject=this.subjects.find(s=>s.id==subjectId);
const group=this.groups.find(g=>g.id===groupId);
const department=this.departments.find(d=>d.id===departmentId);
const assignmentData={
instructorId:instructorId,
subjectId:subjectId,
groupId:groupId,
departmentId:departmentId,
instructorName:`${instructor.surname}${instructor.name}${instructor.patronymic||''}`,
subjectName:subject.name,
groupName:group.number,
departmentName:department.tittle||department.name
};
const result=await apiClient.assignSubjectToInstructor(assignmentData);
if(result.success||result.id){
alert(`Предмет "${subject.name}" успешно назначен преподавателю ${instructor.surname}${instructor.name} для группы ${group.number}`);
await this.loadAssignments();
this.clearAssignmentForm();
}else{
alert('Ошибка при назначении предмета');
}
}catch(error){
console.error('Ошибка назначения предмета:',error);
alert('Ошибка при назначении предмета');
}
}
displayAssignments(){
const assignmentsContainer=document.getElementById('assignments-container');
if(!assignmentsContainer)return;
if(this.assignments.length===0){
assignmentsContainer.innerHTML='<p style="text-align:center;color:#666;padding:20px;">Нет назначенных предметов</p>';
return;
}
assignmentsContainer.innerHTML=this.assignments.map(assignment=>`
<div class="assignment-item" style="border:1px solid #ddd;border-radius:8px;padding:15px;margin:10px 0;background:#f9f9f9;">
<div style="display:flex;justify-content:space-between;align-items:start;">
<div>
<h4 style="margin:0 0 8px 0;">${assignment.subjectName}</h4>
<p style="margin:4px 0;"><strong>Преподаватель:</strong>${assignment.instructorName}</p>
<p style="margin:4px 0;"><strong>Группа:</strong>${assignment.groupName}</p>
<p style="margin:4px 0;"><strong>Кафедра:</strong>${assignment.departmentName}</p>
<small style="color:#666;">Назначено:${new Date(assignment.createdAt).toLocaleDateString('ru-RU')}</small>
</div>
<button class="btn-secondary" onclick="adminApp.removeAssignment('${assignment.id}')" style="padding:5px 10px;font-size:12px;">Удалить</button>
</div>
</div>
`).join('');
}
async removeAssignment(assignmentId){
if(confirm('Удалить это назначение?')){
const assignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
const updatedAssignments=assignments.filter(a=>a.id!==assignmentId);
localStorage.setItem('instructor_assignments',JSON.stringify(updatedAssignments));
await this.loadAssignments();
}
}
clearAssignmentForm(){
document.getElementById('instructor-select').value='';
document.getElementById('subject-assign-select').value='';
document.getElementById('group-assign-select').value='';
document.getElementById('department-select').value='';
}
useDemoData(){
console.log('Используем демо-данные для админки');
this.groups=[
{id:'1',number:'231-324'},
{id:'2',number:'231-325'},
{id:'3',number:'231-326'}
];
this.instructors=[
{id:'1',name:'Иванов',surname:'Петр',patronymic:'Сергеевич'},
{id:'2',name:'Петрова',surname:'Мария',patronymic:'Ивановна'}
];
this.departments=[
{id:'1',tittle:'Информационные системы'},
{id:'2',tittle:'Программная инженерия'}
];
this.subjects=[
{id:1,name:'Системы инженерного анализа',type:'Лаб. работа'},
{id:2,name:'Нормативное регулирование',type:'Лекция'},
{id:3,name:'Базы данных',type:'Практика'}
];
this.populateGroupSelectors();
this.populateInstructorSelector();
this.populateDepartmentSelector();
this.populateSubjectSelector();
this.updateStats();
}
populateGroupSelectors(){
const groupSelect=document.getElementById('group-select');
const groupAssignSelect=document.getElementById('group-assign-select');
if(groupSelect){
groupSelect.innerHTML='<option value="all">Все группы</option>';
this.groups.forEach(group=>{
const option=document.createElement('option');
option.value=group.id;
option.textContent=group.number;
groupSelect.appendChild(option);
});
}
if(groupAssignSelect){
groupAssignSelect.innerHTML='<option value="">Выберите группу</option>';
this.groups.forEach(group=>{
const option=document.createElement('option');
option.value=group.id;
option.textContent=group.number;
groupAssignSelect.appendChild(option);
});
}
}
populateInstructorSelector(){
const select=document.getElementById('instructor-select');
if(!select)return;
select.innerHTML='<option value="">Выберите преподавателя</option>';
this.instructors.forEach(instructor=>{
const option=document.createElement('option');
option.value=instructor.id;
const fullName=`${instructor.surname||''}${instructor.name||''}${instructor.patronymic||''}`.trim();
option.textContent=fullName||`Преподаватель ${instructor.id}`;
select.appendChild(option);
});
}
populateDepartmentSelector(){
const select=document.getElementById('department-select');
if(!select)return;
select.innerHTML='<option value="">Выберите кафедру</option>';
this.departments.forEach(dept=>{
const option=document.createElement('option');
option.value=dept.id;
option.textContent=dept.tittle||dept.name;
select.appendChild(option);
});
}
populateSubjectSelector(){
const select=document.getElementById('subject-assign-select');
if(!select)return;
select.innerHTML='<option value="">Выберите предмет</option>';
this.subjects.forEach(subject=>{
const option=document.createElement('option');
option.value=subject.id;
option.textContent=subject.name;
select.appendChild(option);
});
}
setupEventListeners(){
const uploadArea=document.getElementById('upload-area');
const fileInput=document.getElementById('excel-file');
const uploadBtn=document.getElementById('upload-btn');
const assignBtn=document.getElementById('assign-subject-btn');
if(uploadArea&&fileInput){
uploadArea.addEventListener('click',()=>fileInput.click());
uploadArea.addEventListener('dragover',(e)=>{
e.preventDefault();
uploadArea.style.backgroundColor='#f0f4ff';
});
uploadArea.addEventListener('dragleave',()=>{
uploadArea.style.backgroundColor='';
});
uploadArea.addEventListener('drop',(e)=>{
e.preventDefault();
uploadArea.style.backgroundColor='';
if(e.dataTransfer.files.length){
this.handleFileSelect(e.dataTransfer.files[0]);
}
});
}
if(fileInput){
fileInput.addEventListener('change',(e)=>{
if(e.target.files.length){
this.handleFileSelect(e.target.files[0]);
}
});
}
if(uploadBtn){
uploadBtn.addEventListener('click',()=>this.uploadFile());
}
if(assignBtn){
assignBtn.addEventListener('click',()=>this.assignSubjectToInstructor());
}
const logoutBtn=document.getElementById('admin-logout');
if(logoutBtn){
logoutBtn.addEventListener('click',()=>{
localStorage.removeItem('authToken');
localStorage.removeItem('user');
window.location.href='form.html';
});
}
const navItems=document.querySelectorAll('.nav-item');
navItems.forEach(item=>{
item.addEventListener('click',(e)=>{
e.preventDefault();
const view=item.dataset.view;
this.switchView(view);
navItems.forEach(nav=>nav.classList.remove('active'));
item.classList.add('active');
});
});
}
switchView(view){
console.log('Переключение на вид:',view);
}
handleFileSelect(file){
if(!file.name.match(/\.(xlsx|xls)$/)){
alert('Пожалуйста, выберите Excel файл (.xlsx или .xls)');
return;
}
const uploadArea=document.getElementById('upload-area');
if(uploadArea){
uploadArea.innerHTML=`<p>Выбран файл:${file.name}</p>`;
}
this.selectedFile=file;
}
async uploadFile(){
if(!this.selectedFile){
alert('Пожалуйста, сначала выберите файл');
return;
}
console.log('Начинаем загрузку Excel через Node.js...');
const formData=new FormData();
formData.append('excelFile',this.selectedFile);
try{
const response=await fetch('http://localhost:5000/api/upload-schedule',{
method:'POST',
body:formData
});
if(!response.ok){
throw new Error(`HTTP ${response.status}:${response.statusText}`);
}
const result=await response.json();
console.log('Результат загрузки:',result);
console.log('Студенты из файла:',result.students);
console.log('Группы из файла:',result.groups);
console.log('Всего студентов:',result.students?.length);
if(result.success){
this.uploadedData=result;
this.displayUploadedData();
alert(`Файл успешно загружен! Найдено ${result.students.length} студентов в ${result.groups.length} группах`);
this.showSaveButton();
}else{
alert('Ошибка при обработке файла:'+result.error);
}
}catch(error){
console.error('Ошибка загрузки файла:',error);
alert('Ошибка загрузки файла:'+error.message);
}
}
displayUploadedData(){
if(!this.uploadedData){
console.log('Нет данных для отображения');
return;
}
console.log('Отображаем данные:',this.uploadedData);
const studentsList=document.getElementById('students-list');
const studentsCount=document.getElementById('students-count');
if(!studentsList){
console.error('Элемент students-list не найден!');
return;
}
if(this.uploadedData.students&&this.uploadedData.students.length>0){
studentsList.innerHTML=this.uploadedData.students.map(student=>`
<div class="student-item" style="border:1px solid #ccc;padding:10px;margin:5px;border-radius:5px;">
<div class="student-info">
<div class="student-name" style="font-weight:bold;">${student.fullName}</div>
<div class="student-group">Группа:${student.group}</div>
</div>
</div>
`).join('');
console.log('Студенты отображены на странице');
}else{
studentsList.innerHTML='<p>Нет студентов для отображения</p>';
}
if(studentsCount){
studentsCount.textContent=this.uploadedData.students?.length||0;
}
}
showSaveButton(){
let saveBtn=document.getElementById('save-excel-data');
if(!saveBtn){
saveBtn=document.createElement('button');
saveBtn.id='save-excel-data';
saveBtn.className='btn-primary';
saveBtn.textContent='Сохранить в C# бэкенд';
saveBtn.style.marginTop='10px';
saveBtn.style.width='100%';
saveBtn.style.padding='12px';
saveBtn.onclick=()=>this.saveToBackend();
const uploadArea=document.getElementById('upload-area');
uploadArea.parentNode.insertBefore(saveBtn,uploadArea.nextSibling);
}
saveBtn.style.display='block';
}
async saveToBackend(){
if(!this.uploadedData){
alert('Нет данных для сохранения');
return;
}
try{
console.log('Сохранение данных из Excel');
const results=await apiClient.uploadExcelToBackend(this.uploadedData.students);
const successCount=results.filter(r=>r.success).length;
const errorCount=results.filter(r=>!r.success).length;
if(successCount>0){
alert(`Успешно сохранено:${successCount} студентов${errorCount>0?' Ошибок:'+errorCount:''}`);
this.updateStats();
}else{
alert('Не удалось сохранить ни одного студента');
}
}catch(error){
console.error('Ошибка сохранения:',error);
alert('Бэкенд недоступен. Данные сохранены локально');
this.saveToLocalStorage();
}
}
saveToLocalStorage(){
if(!this.uploadedData)return;
const key=`excel_data_${Date.now()}`;
localStorage.setItem(key,JSON.stringify(this.uploadedData));
alert(`Данные сохранены локально (${this.uploadedData.students.length} студентов)`);
}
updateStats(){
const totalStudents=document.getElementById('total-students');
const totalGroups=document.getElementById('total-groups');
const totalInstructors=document.getElementById('total-instructors');
if(totalStudents)totalStudents.textContent='0';
if(totalGroups)totalGroups.textContent=this.groups.length;
if(totalInstructors)totalInstructors.textContent=this.instructors.length;
}
displayCurrentDate(){
const now=new Date();
const options={
weekday:'long',
year:'numeric',
month:'long',
day:'numeric'
};
const dateElement=document.getElementById('current-date');
if(dateElement){
dateElement.textContent=now.toLocaleDateString('ru-RU',options);
}
}
}
const adminApp=new AdminApp();
window.adminApp=adminApp;