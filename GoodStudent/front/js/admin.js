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
this.students=[];
this.assignments=[];
this.filteredStudents=[];
this.currentFilters={
group:'all',
instructor:'all',
status:'all'
};
this.init();
}
async init(){
this.setupEventListeners();
this.displayCurrentDate();
await this.loadAdminData();
await this.loadAssignments();
this.renderDataTable();
}
async loadAdminData(){
try{
console.log('Загружаем данные для админки');
const[students,groups,instructors,departments,subjects]=await Promise.all([
apiClient.getAllStudents(),
apiClient.getAllGroups(),
apiClient.getAllInstructors(),
apiClient.getAllDepartments(),
apiClient.getAllSubjects()
]);
this.students=students||[];
this.groups=groups||[];
this.instructors=instructors||[];
this.departments=departments||[];
this.subjects=subjects||[];
this.filteredStudents=[...this.students];
console.log('Данные загружены:',this.students.length,'студентов',this.groups.length,'групп');
this.populateAssignmentSelectors();
this.updateStats();
this.renderDataTable();
}catch(error){
console.error('Ошибка загрузки данных админки:',error);
this.useDemoData();
}
}
renderDataTable(){
const tableContainer=document.getElementById('data-table-container');
if(!tableContainer)return;

if(this.students.length===0){
tableContainer.innerHTML=`
<div class="empty-state">
<h4>Нет данных для отображения</h4>
<p>Загрузите студентов из Excel файла</p>
</div>
`;
return;
}

tableContainer.innerHTML=`
<div class="table-filters">
<div class="filter-group">
<label>Группа:</label>
<select id="group-filter" class="filter-select">
<option value="all">Все группы</option>
${this.groups.map(group=>`<option value="${group.id}">${group.number}</option>`).join('')}
</select>
</div>
<div class="filter-group">
<label>Преподаватель:</label>
<select id="instructor-filter" class="filter-select">
<option value="all">Все преподаватели</option>
${this.instructors.map(instructor=>`<option value="${instructor.id}">${instructor.surname} ${instructor.name}</option>`).join('')}
</select>
</div>
<div class="filter-group">
<label>Статус:</label>
<select id="status-filter" class="filter-select">
<option value="all">Все статусы</option>
<option value="0">Активный</option>
<option value="1">Академический отпуск</option>
<option value="2">Отчислен</option>
</select>
</div>
</div>
<div class="table-responsive">
<table class="data-table">
<thead>
<tr>
<th>ID</th>
<th>ФИО студента</th>
<th>
<select class="column-filter" onchange="adminApp.filterByColumn('group', this.value)">
<option value="all">Все группы</option>
${this.groups.map(group=>`<option value="${group.id}">${group.number}</option>`).join('')}
</select>
</th>
<th>Статус</th>
<th>
<select class="column-filter" onchange="adminApp.filterByColumn('instructor', this.value)">
<option value="all">Все преподаватели</option>
${this.instructors.map(instructor=>`<option value="${instructor.id}">${instructor.surname} ${instructor.name}</option>`).join('')}
</select>
</th>
<th>Действия</th>
</tr>
</thead>
<tbody>
${this.filteredStudents.map(student=>{
const group=this.groups.find(g=>g.id===student.groupId);
const statusText=this.getStatusText(student.status);
const assignedInstructor=this.getAssignedInstructor(student.groupId);
return`
<tr>
<td>${student.id}</td>
<td>${student.surname} ${student.name} ${student.patronymic||''}</td>
<td>${group?group.number:'Не указана'}</td>
<td>${statusText}</td>
<td>${assignedInstructor}</td>
<td>
<button class="btn-action btn-edit" onclick="adminApp.editStudent('${student.id}')">редактировать</button>
<button class="btn-action btn-delete" onclick="adminApp.deleteStudent('${student.id}')">удалить</button>
</td>
</tr>
`;
}).join('')}
</tbody>
</table>
</div>
`;

// Добавляем обработчики событий для фильтров
this.setupFilterListeners();
}
setupFilterListeners(){
const groupFilter=document.getElementById('group-filter');
const instructorFilter=document.getElementById('instructor-filter');
const statusFilter=document.getElementById('status-filter');
if(groupFilter){
groupFilter.addEventListener('change',(e)=>{
this.currentFilters.group=e.target.value;
this.applyFilters();
});
}
if(instructorFilter){
instructorFilter.addEventListener('change',(e)=>{
this.currentFilters.instructor=e.target.value;
this.applyFilters();
});
}
if(statusFilter){
statusFilter.addEventListener('change',(e)=>{
this.applyFilters();
});
}
}
filterByColumn(column,value){
if(column==='group'){
this.currentFilters.group=value;
document.getElementById('group-filter').value=value;
}else if(column==='instructor'){
this.currentFilters.instructor=value;
document.getElementById('instructor-filter').value=value;
}
this.applyFilters();
}
getStatusText(status){
switch(status){
case 0:return'<span class="status-active">Активный</span>';
case 1:return'<span class="status-leave">Академический отпуск</span>';
case 2:return'<span class="status-expelled">Отчислен</span>';
default:return'<span class="status-unknown">Неизвестно</span>';
}
}
getAssignedInstructor(groupId){
const assignment=this.assignments.find(a=>a.groupId===groupId);
return assignment?assignment.instructorName:'Не назначен';
}
applyFilters(){
const groupFilter=this.currentFilters.group;
const instructorFilter=this.currentFilters.instructor;
const statusFilter=document.getElementById('status-filter')?.value||'all';
this.filteredStudents=this.students.filter(student=>{
let passGroup=true;
let passInstructor=true;
let passStatus=true;
if(groupFilter!=='all'){
passGroup=student.groupId===groupFilter;
}
if(instructorFilter!=='all'){
const assignment=this.assignments.find(a=>a.groupId===student.groupId&&a.instructorId===instructorFilter);
passInstructor=!!assignment;
}
if(statusFilter!=='all'){
passStatus=student.status==statusFilter;
}
return passGroup&&passInstructor&&passStatus;
});
this.renderTableBody();
this.updateStats();
}
renderTableBody(){
const tbody=document.querySelector('.data-table tbody');
if(!tbody)return;
tbody.innerHTML=this.filteredStudents.map(student=>{
const group=this.groups.find(g=>g.id===student.groupId);
const statusText=this.getStatusText(student.status);
const assignedInstructor=this.getAssignedInstructor(student.groupId);
return`
<tr>
<td>${student.id}</td>
<td>${student.surname} ${student.name} ${student.patronymic||''}</td>
<td>${group?group.number:'Не указана'}</td>
<td>${statusText}</td>
<td>${assignedInstructor}</td>
<td>
<button class="btn-action btn-edit" onclick="adminApp.editStudent('${student.id}')">✏️</button>
<button class="btn-action btn-delete" onclick="adminApp.deleteStudent('${student.id}')">🗑️</button>
</td>
</tr>
`;
}).join('');
}
populateAssignmentSelectors(){
const instructorSelect=document.getElementById('instructor-select');
const subjectSelect=document.getElementById('subject-assign-select');
const groupAssignSelect=document.getElementById('group-assign-select');
const departmentSelect=document.getElementById('department-select');
if(instructorSelect){
instructorSelect.innerHTML='<option value="">Выберите преподавателя</option>';
this.instructors.forEach(instructor=>{
const option=document.createElement('option');
option.value=instructor.id;
option.textContent=`${instructor.surname} ${instructor.name}`;
instructorSelect.appendChild(option);
});
}
if(subjectSelect){
subjectSelect.innerHTML='<option value="">Выберите предмет</option>';
this.subjects.forEach(subject=>{
const option=document.createElement('option');
option.value=subject.id;
option.textContent=subject.name;
subjectSelect.appendChild(option);
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
if(departmentSelect){
departmentSelect.innerHTML='<option value="">Выберите кафедру</option>';
this.departments.forEach(dept=>{
const option=document.createElement('option');
option.value=dept.id;
option.textContent=dept.tittle||dept.name;
departmentSelect.appendChild(option);
});
}
}
async loadAssignments(){
try{
const allAssignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
this.assignments=allAssignments;
this.displayAssignments();
this.updateStats();
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
instructorName:`${instructor.surname} ${instructor.name} ${instructor.patronymic||''}`.trim(),
subjectName:subject.name,
groupName:group.number,
departmentName:department.tittle||department.name
};
const result=await apiClient.assignSubjectToInstructor(assignmentData);
if(result.success||result.id){
alert(`Предмет "${subject.name}" успешно назначен преподавателю ${assignmentData.instructorName} для группы ${group.number}`);
await this.loadAssignments();
this.clearAssignmentForm();
this.renderDataTable();
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
<div class="assignment-item">
<div class="assignment-header">
<h4>${assignment.subjectName}</h4>
<button class="btn-remove" onclick="adminApp.removeAssignment('${assignment.id}')">×</button>
</div>
<div class="assignment-details">
<p><strong>Преподаватель:</strong> ${assignment.instructorName}</p>
<p><strong>Группа:</strong> ${assignment.groupName}</p>
<p><strong>Кафедра:</strong> ${assignment.departmentName}</p>
<small>Назначено: ${new Date(assignment.createdAt).toLocaleDateString('ru-RU')}</small>
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
this.renderDataTable();
}
}
clearAssignmentForm(){
document.getElementById('instructor-select').value='';
document.getElementById('subject-assign-select').value='';
document.getElementById('group-assign-select').value='';
document.getElementById('department-select').value='';
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
}
handleFileSelect(file){
if(!file.name.match(/\.(xlsx|xls)$/)){
alert('Пожалуйста, выберите Excel файл (.xlsx или .xls)');
return;
}
const uploadArea=document.getElementById('upload-area');
if(uploadArea){
uploadArea.innerHTML=`<p style="color:green; font-weight:bold;">✓ Выбран файл: ${file.name}</p>`;
}
this.selectedFile=file;
document.getElementById('upload-btn').disabled=false;
}
async uploadFile(){
if(!this.selectedFile){
alert('Пожалуйста, сначала выберите файл');
return;
}
console.log('Начинаем загрузку Excel...');
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
if(result.success){
this.uploadedData=result;
alert(`Файл успешно загружен! Найдено ${result.students.length} студентов в ${result.groups.length} группах`);
this.showSaveButton();
// Показываем preview загруженных студентов
this.showUploadedStudentsPreview(result.students);
}else{
alert('Ошибка при обработке файла:'+result.error);
}
}catch(error){
console.error('Ошибка загрузки файла:',error);
alert('Ошибка загрузки файла:'+error.message);
}
}
showUploadedStudentsPreview(students){
const previewContainer=document.createElement('div');
previewContainer.className='upload-preview';
previewContainer.innerHTML=`
<h4>Предпросмотр загруженных студентов (${students.length}):</h4>
<div style="max-height:200px;overflow-y:auto;margin:10px 0;">
${students.map(student=>`
<div style="padding:5px;border-bottom:1px solid #eee;">
<strong>${student.fullName}</strong> - Группа: ${student.group}
</div>
`).join('')}
</div>
`;
const uploadArea=document.getElementById('upload-area');
uploadArea.appendChild(previewContainer);
}
showSaveButton(){
let saveBtn=document.getElementById('save-excel-data');
if(!saveBtn){
saveBtn=document.createElement('button');
saveBtn.id='save-excel-data';
saveBtn.className='btn-primary';
saveBtn.textContent='Сохранить студентов в систему';
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
alert(`Успешно сохранено: ${successCount} студентов${errorCount>0?', ошибок: '+errorCount:''}`);
// Очищаем preview
const preview=document.querySelector('.upload-preview');
if(preview)preview.remove();
// Обновляем данные и таблицу
await this.loadAdminData();
this.renderDataTable();
// Сбрасываем форму загрузки
this.resetUploadForm();
}else{
alert('Не удалось сохранить ни одного студента');
}
}catch(error){
console.error('Ошибка сохранения:',error);
alert('Ошибка при сохранении данных: '+error.message);
}
}
resetUploadForm(){
const uploadArea=document.getElementById('upload-area');
uploadArea.innerHTML=`
<div class="upload-placeholder">
<div class="upload-icon"></div>
<p>Перетащите Excel файл сюда или нажмите для выбора</p>
<small>Поддерживаются файлы .xlsx, .xls</small>
</div>
`;
document.getElementById('excel-file').value='';
document.getElementById('upload-btn').disabled=true;
this.selectedFile=null;
const saveBtn=document.getElementById('save-excel-data');
if(saveBtn)saveBtn.style.display='none';
}
updateStats(){
const totalStudents=document.getElementById('total-students');
const totalGroups=document.getElementById('total-groups');
const totalTeachers=document.getElementById('total-teachers');
const totalAssignments=document.getElementById('total-assignments');
if(totalStudents)totalStudents.textContent=this.students.length;
if(totalGroups)totalGroups.textContent=this.groups.length;
if(totalTeachers)totalTeachers.textContent=this.instructors.length;
if(totalAssignments)totalAssignments.textContent=this.assignments.length;
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
editStudent(studentId){
alert('Редактирование студента будет доступно в следующей версии');
}
deleteStudent(studentId){
if(confirm('Удалить этого студента?')){
this.students=this.students.filter(s=>s.id!==studentId);
this.filteredStudents=this.filteredStudents.filter(s=>s.id!==studentId);
this.renderDataTable();
this.updateStats();
}
}
useDemoData(){
console.log('Используем демо-данные для админки');
this.students=this.getFallbackStudents();
this.groups=this.getFallbackGroups();
this.instructors=this.getFallbackInstructors();
this.departments=this.getFallbackDepartments();
this.subjects=this.getFallbackSubjects();
this.filteredStudents=[...this.students];
this.populateAssignmentSelectors();
this.updateStats();
this.renderDataTable();
}
getFallbackStudents(){
return[
{id:'1',name:'Иван',surname:'Иванов',patronymic:'Иванович',groupId:'1',status:0},
{id:'2',name:'Мария',surname:'Петрова',patronymic:'Сергеевна',groupId:'1',status:0},
{id:'3',name:'Сергей',surname:'Сидоров',patronymic:'Алексеевич',groupId:'2',status:0},
{id:'4',name:'Анна',surname:'Козлова',patronymic:'Владимировна',groupId:'2',status:0},
{id:'5',name:'Дмитрий',surname:'Фролов',patronymic:'Петрович',groupId:'3',status:0}
];
}
getFallbackGroups(){
return[
{id:'1',number:'231-324',professionId:'1'},
{id:'2',number:'231-325',professionId:'1'},
{id:'3',number:'231-326',professionId:'2'},
{id:'4',number:'231-327',professionId:'2'}
];
}
getFallbackInstructors(){
return[
{id:'1',name:'Петр',surname:'Иванов',patronymic:'Сергеевич',departmentId:'1'},
{id:'2',name:'Мария',surname:'Петрова',patronymic:'Ивановна',departmentId:'1'},
{id:'3',name:'Алексей',surname:'Сидоров',patronymic:'Владимирович',departmentId:'2'},
{id:'4',name:'Ольга',surname:'Макарова',patronymic:'Сергеевна',departmentId:'2'}
];
}
getFallbackDepartments(){
return[
{id:'1',tittle:'Информационные системы',description:'Кафедра информационных систем'},
{id:'2',tittle:'Программная инженерия',description:'Кафедра программной инженерии'},
{id:'3',tittle:'Компьютерная безопасность',description:'Кафедра компьютерной безопасности'}
];
}
getFallbackSubjects(){
return[
{id:1,name:'Системы инженерного анализа',type:'Лаб. работа'},
{id:2,name:'Нормативное регулирование',type:'Лекция'},
{id:3,name:'Базы данных',type:'Практика'},
{id:4,name:'Веб-программирование',type:'Лаб. работа'}
];
}
}
const adminApp=new AdminApp();
window.adminApp=adminApp;