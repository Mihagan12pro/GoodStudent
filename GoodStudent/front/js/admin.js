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
this.currentTab='students';
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
console.log('Загружаем данные из Node.js API...');
const[students,groups,instructors,departments,subjects,faculties]=await Promise.all([
apiClient.getAllStudents(),
apiClient.getAllGroups(),
apiClient.getAllInstructors(),
apiClient.getAllDepartments(),
apiClient.getAllSubjects(),
apiClient.getFullFaculties()
]);
console.log('ДАННЫЕ ПРЕПОДАВАТЕЛЕЙ С СЕРВЕРА:',instructors);
this.students=students||[];
this.groups=groups||[];
this.instructors=(instructors||[]).map(instructor=>({
...instructor,
name:this.fixEncoding(instructor.name),
surname:this.fixEncoding(instructor.surname),
patronymic:this.fixEncoding(instructor.patronymic)
}));
this.departments=departments||[];
this.subjects=subjects||[];
this.faculties=faculties||[];
console.log('ДАННЫЕ ДЛЯ НАЗНАЧЕНИЙ:',{
instructors:this.instructors,
subjects:this.subjects,
groups:this.groups,
departments:this.departments
});
this.filteredStudents=[...this.students];
this.populateAssignmentSelectors();
this.updateStats();
this.renderDataTable();
this.loadTabData(this.currentTab);
}catch(error){
console.error('Ошибка загрузки данных из Node.js API:',error);
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
<select class="column-filter" onchange="adminApp.filterByColumn('group',this.value)">
<option value="all">Все группы</option>
${this.groups.map(group=>`<option value="${group.id}">${group.number}</option>`).join('')}
</select>
</th>
<th>Статус</th>
<th>
<select class="column-filter" onchange="adminApp.filterByColumn('instructor',this.value)">
<option value="all">Все преподаватели</option>
${this.instructors.map(instructor=>`<option value="${instructor.id}">${instructor.surname}${instructor.name}</option>`).join('')}
</select>
</th>
<th>Действия</th>
</tr>
</thead>
<tbody>
${this.filteredStudents.map(student=>{
const group=this.groups.find(g=>g.id===student.groupId);
const statusText=this.getStatusText(student.status);
const assignedInstructor = this.getAssignedInstructors(student.groupId);
return`
<tr>
<td>${student.id}</td>
<td>${student.surname} ${student.name} ${student.patronymic || ''}</td>
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
getAssignedInstructors(groupId) {
    const assignments = this.assignments.filter(a => a.group_id === groupId);
    if (assignments.length === 0) return 'Не назначены';
    const instructorNames = [];
    assignments.forEach(assignment => {
        const instructor = this.instructors.find(i => i.id === assignment.instructor_id);
        const subject = this.subjects.find(s => s.id === assignment.subject_id);
        if (instructor && subject) {
            instructorNames.push(`${instructor.surname} ${instructor.name} (${subject.name})`);
        }
    });    
    return instructorNames.join(', ');
}
getAssignedInstructors(groupId) {
    const assignments = this.assignments.filter(a => a.group_id === groupId);
    if (assignments.length === 0) return 'Не назначены';
    
    // Собираем ВСЕХ преподавателей этой группы
    const instructorNames = [];
    assignments.forEach(assignment => {
        const instructor = this.instructors.find(i => i.id === assignment.instructor_id);
        const subject = this.subjects.find(s => s.id === assignment.subject_id);
        if (instructor && subject) {
            instructorNames.push(`${instructor.surname} ${instructor.name} (${subject.name})`);
        }
    });
    
    return instructorNames.join(', ');
}
applyFilters(){
const groupFilter=document.getElementById('group-filter')?.value||'all';
const instructorFilter=document.getElementById('instructor-filter')?.value||'all';
const statusFilter=document.getElementById('status-filter')?.value||'all';
this.currentFilters={
group:groupFilter,
instructor:instructorFilter,
status:statusFilter
};
console.log('Применяем фильтры:',this.currentFilters);
this.filteredStudents=this.students.filter(student=>{
let passGroup=true;
let passInstructor=true;
let passStatus=true;
if(this.currentFilters.group!=='all'){
passGroup=student.groupId===this.currentFilters.group;
}
if(this.currentFilters.instructor!=='all'){
const assignment=this.assignments.find(a=>a.group_id===student.groupId&&a.instructor_id===this.currentFilters.instructor);
passInstructor=!!assignment;
}
if(this.currentFilters.status!=='all'){
passStatus=student.status==this.currentFilters.status;
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
<td>${student.surname} ${student.name} ${student.patronymic || ''}</td>
<td>${group?group.number:'Не указана'}</td>
<td>${statusText}</td>
<td>${this.getAssignedInstructors(student.groupId)}</td>
<td>
<button class="btn-action btn-edit" onclick="adminApp.editStudent('${student.id}')">редактировать</button>
<button class="btn-action btn-delete" onclick="adminApp.deleteStudent('${student.id}')">удалить</button>
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
console.log('ОТЛАДКА populateAssignmentSelectors');
console.log('Найдены элементы:',{
instructorSelect:!!instructorSelect,
subjectSelect:!!subjectSelect,
groupAssignSelect:!!groupAssignSelect,
departmentSelect:!!departmentSelect
});
console.log('Данные для заполнения:',{
instructors:this.instructors,
subjects:this.subjects,
groups:this.groups,
departments:this.departments
});
if(instructorSelect){
console.log('Заполняем селектор преподавателей...');
instructorSelect.innerHTML='<option value="">Выберите преподавателя</option>';
this.instructors.forEach(instructor=>{
const option=document.createElement('option');
option.value=instructor.id;
const displayName = `${instructor.surname} ${instructor.name} ${instructor.patronymic || ''}`.trim();
option.textContent=displayName;
console.log('Добавляем преподавателя:',displayName,'ID:',instructor.id);
instructorSelect.appendChild(option);
});
console.log('Добавлено преподавателей в селектор:',this.instructors.length);
}else{
console.error('Элемент instructor-select не найден!');
}
if(subjectSelect){
console.log('Заполняем селектор предметов...');
subjectSelect.innerHTML='<option value="">Выберите предмет</option>';
this.subjects.forEach(subject=>{
const option=document.createElement('option');
option.value=subject.id;
const displayName=subject.name||subject.tittle||'Без названия';
option.textContent=displayName;
console.log('Добавляем предмет:',displayName,'ID:',subject.id);
subjectSelect.appendChild(option);
});
console.log('Добавлено предметов в селектор:',this.subjects.length);
}else{
console.error('Элемент subject-assign-select не найден!');
}
if(groupAssignSelect){
console.log('Заполняем селектор групп...');
groupAssignSelect.innerHTML='<option value="">Выберите группу</option>';
this.groups.forEach(group=>{
const option=document.createElement('option');
option.value=group.id;
option.textContent=group.number;
console.log('Добавляем группу:',group.number,'ID:',group.id);
groupAssignSelect.appendChild(option);
});
console.log('Добавлено групп в селектор:',this.groups.length);
}else{
console.error('Элемент group-assign-select не найден!');
}
if(departmentSelect){
console.log('Заполняем селектор кафедр...');
departmentSelect.innerHTML='<option value="">Выберите кафедру</option>';
this.departments.forEach(dept=>{
const option=document.createElement('option');
option.value=dept.id;
option.textContent=dept.tittle;
console.log('Добавляем кафедру:',dept.tittle,'ID:',dept.id);
departmentSelect.appendChild(option);
});
console.log('Добавлено кафедр в селектор:',this.departments.length);
}else{
console.error('Элемент department-select не найден!');
}
const debugInfo=`
<div style="background:#f0f8ff;padding:10px;margin:10px;border-radius:5px;border:1px solid #667eea;">
<h4>Отладочная информация назначений:</h4>
<p><strong>Преподаватели:</strong>${this.instructors.length}(должны быть в списке выше)</p>
<p><strong>Предметы:</strong>${this.subjects.length}(должны быть в списке выше)</p>
<p><strong>Группы:</strong>${this.groups.length}(должны быть в списке выше)</p>
<p><strong>Кафедры:</strong>${this.departments.length}(должны быть в списке выше)</p>
<p><strong>Селекторы найдены:</strong>
instructor:${!!instructorSelect},
subject:${!!subjectSelect},
group:${!!groupAssignSelect},
department:${!!departmentSelect}
</p>
</div>
`;
const assignmentSection=document.querySelector('.assignment-section');
if(assignmentSection){
const oldDebug=assignmentSection.querySelector('.debug-info');
if(oldDebug)oldDebug.remove();
const debugDiv=document.createElement('div');
debugDiv.className='debug-info';
debugDiv.innerHTML=debugInfo;
assignmentSection.insertBefore(debugDiv,assignmentSection.firstChild);
}
console.log('===ЗАВЕРШЕНИЕ populateAssignmentSelectors===');
}
async loadAssignments(){
try{
const response=await fetch('http://localhost:5000/api/assignments');
if(response.ok){
this.assignments=await response.json();
console.log('Назначения загружены:',this.assignments);
}else{
this.assignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
}
this.displayAssignments();
this.updateStats();
}catch(error){
console.error('Ошибка загрузки назначений:',error);
this.assignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
this.displayAssignments();
}
}
async assignSubjectToInstructor() {
    const instructorId = document.getElementById('instructor-select').value;
    const subjectId = document.getElementById('subject-assign-select').value;
    const groupId = document.getElementById('group-assign-select').value;
    const departmentId = document.getElementById('department-select').value;    
    if (!instructorId || !subjectId || !groupId || !departmentId) {
        alert('Заполните все поля');
        return;
    }    
    try {
        const instructor = this.instructors.find(i => i.id === instructorId);
        const subject = this.subjects.find(s => s.id == subjectId);
        const group = this.groups.find(g => g.id === groupId);
        const department = this.departments.find(d => d.id === departmentId);
        
        const assignmentData = {
            instructorId: instructorId,
            subjectId: subjectId,
            groupId: groupId,
            departmentId: departmentId
        };        
        const response = await fetch('http://localhost:5000/api/assignments', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(assignmentData)
        });      
        if (response.ok) {
            const result = await response.json();
            alert(`Предмет "${subject.name}" успешно назначен преподавателю ${instructor.surname} ${instructor.name} для группы ${group.number}`);
            await this.loadAssignments();
            this.clearAssignmentForm();
            this.renderDataTable();
        } else {
            const errorData = await response.json();
            if (errorData.existingId) {
                alert('Такое назначение уже существует');
            } else {
                alert('Ошибка при назначении предмета');
            }
        }
    } catch (error) {
        console.error('Ошибка назначения предмета:', error);
        alert('Ошибка при назначении предмета');
    }
}
async removeAssignment(assignmentId){
if(confirm('Удалить это назначение?')){
try{
const response=await fetch(`http://localhost:5000/api/assignments/${assignmentId}`,{
method:'DELETE'
});
if(response.ok){
await this.loadAssignments();
this.renderDataTable();
alert('Назначение удалено');
}else{
alert('Ошибка при удалении назначения');
}
}catch(error){
console.error('Ошибка удаления назначения:',error);
alert('Ошибка при удалении назначения');
}
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
<h4>${assignment.subject_name}</h4>
<button class="btn-remove" onclick="adminApp.removeAssignment('${assignment.id}')">×</button>
</div>
<div class="assignment-details">
<p><strong>Преподаватель:</strong>${assignment.instructor_surname}${assignment.instructor_name}</p>
<p><strong>Группа:</strong>${assignment.group_number}</p>
<p><strong>Кафедра:</strong>${assignment.department_name}</p>
<small>Назначено:${new Date(assignment.created_at).toLocaleDateString('ru-RU')}</small>
</div>
</div>
`).join('');
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
const tabBtns=document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn=>{
btn.addEventListener('click',(e)=>{
const tabName=e.target.dataset.tab;
this.switchTab(tabName);
});
});
const addDeptBtn=document.getElementById('add-department-btn');
if(addDeptBtn){
addDeptBtn.addEventListener('click',()=>{
this.addNewDepartment();
});
}
}
switchTab(tabName){
console.log('Переключаем на вкладку:',tabName);
document.querySelectorAll('.tab-btn').forEach(btn=>{
btn.classList.remove('active');
});
document.querySelectorAll('.tab-content').forEach(content=>{
content.classList.remove('active');
});
const activeTabBtn=document.querySelector(`[data-tab="${tabName}"]`);
const activeTabContent=document.getElementById(`${tabName}-tab`);
if(activeTabBtn&&activeTabContent){
activeTabBtn.classList.add('active');
activeTabContent.classList.add('active');
this.currentTab=tabName;
this.loadTabData(tabName);
}
}
loadTabData(tabName){
switch(tabName){
case'departments':
this.renderDepartmentsTab();
break;
case'assignments':
break;
case'upload':
break;
case'students':
break;
case'interactive':
this.renderInteractiveTab();
break;
}
}
renderDepartmentsTab(){
this.renderDepartmentsCards();
this.renderFacultiesCards();
}
fixEncoding(text){
if(!text)return text;
return text
.replace(/Љ/g,'К')
.replace(/дҐ¤а/g,'афедра')
.replace(/Ёд®а¬/g,'информ')
.replace(/вҐе®«®Ј/g,'технолог')
.replace(/Їа®Ја/g,'прогр')
.replace(/¬/g,'м')
.replace(/Ґ/g,'е')
.replace(/®/g,'о')
.replace(/Є/g,'к');
}
renderDepartmentsCards(){
const container=document.getElementById('departments-cards');
if(!container)return;
container.innerHTML=this.departments.map(dept=>`
<div class="department-card">
<div class="card-header">
<h4>${dept.tittle||'Без названия'}</h4>
<div class="card-actions">
<button class="btn-action btn-edit" onclick="adminApp.editDepartment('${dept.id}')">редактировать</button>
<button class="btn-action btn-delete" onclick="adminApp.deleteDepartment('${dept.id}')">удалить</button>
</div>
</div>
<div class="card-body">
<p>${this.fixEncoding(dept.description)||'Описание отсутствует'}</p>
<div class="department-stats">
<span>Преподавателей:${this.getInstructorsCount(dept.id)}</span>
<span>Предметов:${this.getSubjectsCount(dept.id)}</span>
</div>
</div>
</div>
`).join('');
}
getSubjectsCount(departmentId){
return this.subjects.filter(subject=>subject.department_id===departmentId).length;
}
renderFacultiesCards(){
const container=document.getElementById('faculties-cards');
if(!container)return;
if(this.faculties.length===0){
container.innerHTML=`
<div class="empty-state" style="grid-column:1/-1;">
<h4>Нет данных о факультетах</h4>
<p>Факультеты не загружены</p>
</div>
`;
return;
}
container.innerHTML=this.faculties.map(faculty=>`
<div class="department-card">
<div class="card-header">
<h4>${faculty.tittle||'Без названия'}</h4>
</div>
<div class="card-body">
<p>${this.fixEncoding(faculty.description)||'Описание отсутствует'}</p>
<div class="department-stats">
<span>ID:${faculty.id.substring(0,8)}...</span>
</div>
</div>
</div>
`).join('');
}
getInstructorsCount(departmentId){
return this.instructors.filter(instructor=>instructor.departmentId===departmentId).length;
}
addNewDepartment(){
alert('Добавление новой кафедры будет реализовано в следующем обновлении');
}
editDepartment(departmentId){
alert(`Редактирование кафедры${departmentId}будет реализовано в следующем обновлении`);
}
deleteDepartment(departmentId){
if(confirm('Удалить эту кафедру?')){
alert(`Удаление кафедры${departmentId}будет реализовано в следующем обновлении`);
}
}
handleFileSelect(file){
if(!file.name.match(/\.(xlsx|xls)$/)){
alert('Пожалуйста, выберите Excel файл (.xlsx или .xls)');
return;
}
const uploadArea=document.getElementById('upload-area');
if(uploadArea){
uploadArea.innerHTML=`<p style="color:green;font-weight:bold;">✓Выбран файл:${file.name}</p>`;
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
throw new Error(`HTTP${response.status}:${response.statusText}`);
}
const result=await response.json();
console.log('Результат загрузки:',result);
if(result.success){
this.uploadedData=result;
alert(`Файл успешно загружен!Найдено${result.students.length}студентов в${result.groups.length}группах`);
this.showSaveButton();
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
<h4>Предпросмотр загруженных студентов(${students.length}):</h4>
<div style="max-height:200px;overflow-y:auto;margin:10px 0;">
${students.map(student=>`
<div style="padding:5px;border-bottom:1px solid #eee;">
<strong>${student.fullName}</strong>-Группа:${student.group}
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
alert(`Успешно сохранено:${successCount}студентов${errorCount>0?',ошибок:'+errorCount:''}`);
const preview=document.querySelector('.upload-preview');
if(preview)preview.remove();
await this.loadAdminData();
this.renderDataTable();
this.resetUploadForm();
}else{
alert('Не удалось сохранить ни одного студента');
}
}catch(error){
console.error('Ошибка сохранения:',error);
alert('Ошибка при сохранении данных:'+error.message);
}
}
resetUploadForm(){
const uploadArea=document.getElementById('upload-area');
if(uploadArea){
uploadArea.innerHTML=`
<div class="upload-placeholder">
<div class="upload-icon"></div>
<p>Перетащите Excel файл сюда или нажмите для выбора</p>
<small>Поддерживаются файлы .xlsx,.xls</small>
</div>
`;
}
const fileInput=document.getElementById('excel-file');
if(fileInput)fileInput.value='';
const uploadBtn=document.getElementById('upload-btn');
if(uploadBtn)uploadBtn.disabled=true;
this.selectedFile=null;
const saveBtn=document.getElementById('save-excel-data');
if(saveBtn)saveBtn.style.display='none';
}
updateStats(){
const totalStudents=document.getElementById('total-students');
const totalGroups=document.getElementById('total-groups');
const totalTeachers=document.getElementById('total-teachers');
const totalAssignments=document.getElementById('total-assignments');
const totalDepartments=document.getElementById('total-departments');
const totalFaculties=document.getElementById('total-faculties');
if(totalStudents)totalStudents.textContent=this.students.length;
if(totalGroups)totalGroups.textContent=this.groups.length;
if(totalTeachers)totalTeachers.textContent=this.instructors.length;
if(totalAssignments)totalAssignments.textContent=this.assignments.length;
if(totalDepartments)totalDepartments.textContent=this.departments.length;
if(totalFaculties)totalFaculties.textContent=this.faculties.length;
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
const student=this.students.find(s=>s.id===studentId);
if(!student)return;
const newName=prompt('Имя:',student.name);
const newSurname=prompt('Фамилия:',student.surname);
const newPatronymic=prompt('Отчество:',student.patronymic||'');
let groupOptions=this.groups.map(g=>`${g.id}:${g.number}`).join('\n');
const groupInput=prompt(`Группа(${groupOptions}):`,student.groupId);
const statusInput=prompt('Статус(0-активный,1-академ,2-отчислен):',student.status);
if(newName&&newSurname){
const updateData={
name:newName,
surname:newSurname,
patronymic:newPatronymic,
groupId:groupInput||student.groupId,
status:parseInt(statusInput)||student.status
};
apiClient.updateStudent(studentId,updateData)
.then(result=>{
if(result.success){
Object.assign(student,updateData);
this.renderDataTable();
alert('Студент успешно обновлен!');
}else{
alert('Ошибка при обновлении студента:'+result.error);
}
})
.catch(error=>{
alert('Ошибка при обновлении студента:'+error.message);
});
}
}
deleteStudent(studentId){
if(confirm('Удалить этого студента?')){
this.students=this.students.filter(s=>s.id!==studentId);
this.filteredStudents=this.filteredStudents.filter(s=>s.id!==studentId);
this.renderDataTable();
this.updateStats();
alert('Студент удален(пока только локально)');
}
}
useDemoData(){
console.log('Используем демо-данные для админки');
this.students=this.getFallbackStudents();
this.groups=this.getFallbackGroups();
this.instructors=this.getFallbackInstructors();
this.departments=this.getFallbackDepartments();
this.subjects=this.getFallbackSubjects();
this.assignments=this.getFallbackAssignments();
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
getFallbackAssignments(){
return[
{id:'1',instructor_id:'1',instructor_name:'Иванов',instructor_surname:'Петр',subject_id:'1',subject_name:'Системы инженерного анализа',group_id:'1',group_number:'231-324',department_id:'1',department_name:'Информационные системы',created_at:new Date()}
];
}
renderSubjectsTab(){
this.renderSubjectsCards();
}
renderSubjectsCards(){
const container=document.getElementById('subjects-cards');
if(!container)return;
if(this.subjects.length===0){
container.innerHTML=`
<div class="empty-state" style="grid-column:1/-1;">
<h4>В базе нет предметов</h4>
<p>Предметы не найдены в таблице subjects</p>
</div>
`;
return;
}
container.innerHTML=this.subjects.map(subject=>{
const department=this.departments.find(d=>d.id===subject.department_id);
return`
<div class="department-card">
<div class="card-header">
<h4>${subject.name||'Без названия'}</h4>
<div class="card-actions">
<button class="btn-action btn-edit" onclick="adminApp.editSubject('${subject.id}')">редактировать</button>
<button class="btn-action btn-delete" onclick="adminApp.deleteSubject('${subject.id}')">удалить</button>
</div>
</div>
<div class="card-body">
<p>Тип:${subject.type||'Не указан'}</p>
<p>Кафедра:${department?department.tittle:'Не назначена'}</p>
<div class="department-stats">
<span>ID:${subject.id}</span>
</div>
</div>
</div>
`;
}).join('');
}
renderInteractiveTab(){
console.log('===ОТЛАДКА renderInteractiveTab===');
console.log('Данные для интерактивной таблицы:',{
faculties:this.faculties,
departments:this.departments,
subjects:this.subjects,
groups:this.groups,
instructors:this.instructors
});
this.renderInteractiveTable();
this.populateInteractiveFilters();
const debugFaculties=document.getElementById('debug-faculties');
const debugDepartments=document.getElementById('debug-departments-interactive');
const debugSubjects=document.getElementById('debug-subjects-interactive');
const debugGroups=document.getElementById('debug-groups-interactive');
const debugInstructors=document.getElementById('debug-instructors-interactive');
if(debugFaculties)debugFaculties.textContent=this.faculties.length;
if(debugDepartments)debugDepartments.textContent=this.departments.length;
if(debugSubjects)debugSubjects.textContent=this.subjects.length;
if(debugGroups)debugGroups.textContent=this.groups.length;
if(debugInstructors)debugInstructors.textContent=this.instructors.length;
console.log('Отладочная информация обновлена в HTML');
console.log('===ЗАВЕРШЕНИЕ renderInteractiveTab===');
}
populateInteractiveFilters(){
const facultyFilter=document.getElementById('faculty-filter');
const groupFilter=document.getElementById('group-interactive-filter');
console.log('Заполняем фильтры интерактивной таблицы...');
if(facultyFilter){
facultyFilter.innerHTML='<option value="all">Все факультеты</option>';
this.faculties.forEach(faculty=>{
const option=document.createElement('option');
option.value=faculty.id;
option.textContent=faculty.tittle;
facultyFilter.appendChild(option);
});
console.log('Добавлено факультетов в фильтр:',this.faculties.length);
}else{
console.error('Элемент faculty-filter не найден!');
}
if(groupFilter){
groupFilter.innerHTML='<option value="all">Все группы</option>';
this.groups.forEach(group=>{
const option=document.createElement('option');
option.value=group.id;
option.textContent=group.number;
groupFilter.appendChild(option);
});
console.log('Добавлено групп в фильтр:',this.groups.length);
}else{
console.error('Элемент group-interactive-filter не найден!');
}
}
renderInteractiveTable(){
const container=document.getElementById('interactive-table-body');
if(!container){
console.error('Элемент interactive-table-body не найден!');
return;
}
console.log('Рендерим интерактивную таблицу...');
let html='';
if(!this.faculties||this.faculties.length===0){
html=`
<tr>
<td colspan="5" style="text-align:center;padding:40px;color:#666;">
<h4>Нет данных для отображения</h4>
<p>Факультеты не загружены</p>
</td>
</tr>
`;
container.innerHTML=html;
return;
}
this.faculties.forEach(faculty=>{
const facultyDepartments=this.departments.filter(dept=>dept.facultyId===faculty.id);
if(facultyDepartments.length>0){
html+=`<tr class="department-section">
<td colspan="5"><strong>${faculty.tittle}</strong></td>
</tr>`;
facultyDepartments.forEach(department=>{
const departmentSubjects=this.subjects.filter(subj=>subj.departmentId===department.id);
const departmentInstructors=this.instructors.filter(inst=>inst.departmentId===department.id);
html+=`<tr>
<td>
<strong>${department.tittle}</strong>
<br><small>${department.description||'Описание отсутствует'}</small>
</td>
<td>`;
departmentSubjects.forEach(subject=>{
html+=`<div class="subject-item">
${subject.name}(${subject.type||'Не указан'})
</div>`;
});
if(departmentSubjects.length===0){
html+=`<div class="subject-item" style="color:#999;">Нет предметов</div>`;
}
html+=`</td>
<td>`;
this.groups.forEach(group=>{
html+=`<div class="group-item">
${group.number}
</div>`;
});
html+=`</td>
<td>`;
departmentInstructors.forEach(instructor=>{
html+=`<div class="subject-item">
${instructor.surname} ${instructor.name}
</div>`;
});
if(departmentInstructors.length===0){
html+=`<div class="subject-item" style="color:#999;">Нет преподавателей</div>`;
}
html+=`</td>
<td>
<div class="assignment-controls">
<select class="assignment-select" data-department="${department.id}">
<option value="">Выберите предмет</option>
${departmentSubjects.map(subj=>
`<option value="${subj.id}">${subj.name}</option>`
).join('')}
</select>
<select class="assignment-select" data-department="${department.id}">
<option value="">Выберите группу</option>
${this.groups.map(group=>
`<option value="${group.id}">${group.number}</option>`
).join('')}
</select>
<select class="assignment-select" data-department="${department.id}">
<option value="">Выберите преподавателя</option>
${departmentInstructors.map(inst=>
`<option value="${inst.id}">${inst.surname}${inst.name}</option>`
).join('')}
</select>
<button class="btn-action btn-edit" onclick="adminApp.createAssignmentFromInteractive('${department.id}')">
Назначить
</button>
</div>
</td>
</tr>`;
});
}
});
container.innerHTML=html;
console.log('Интерактивная таблица отрендерена');
this.setupInteractiveListeners();
}
setupInteractiveListeners(){
const facultyFilter=document.getElementById('faculty-filter');
const groupFilter=document.getElementById('group-interactive-filter');
if(facultyFilter){
facultyFilter.addEventListener('change',()=>this.filterInteractiveTable());
}
if(groupFilter){
groupFilter.addEventListener('change',()=>this.filterInteractiveTable());
}
}
filterInteractiveTable(){
this.renderInteractiveTable();
}
createAssignmentFromInteractive(departmentId){
const row=event.target.closest('tr');
const subjectSelect=row.querySelector('select[data-department]');
const groupSelect=row.querySelectorAll('select[data-department]')[1];
const instructorSelect=row.querySelectorAll('select[data-department]')[2];
const subjectId=subjectSelect.value;
const groupId=groupSelect.value;
const instructorId=instructorSelect.value;
if(!subjectId||!groupId||!instructorId){
alert('Заполните все поля для назначения');
return;
}
this.assignSubjectToInstructorInteractive(instructorId,subjectId,groupId,departmentId);
}
async assignSubjectToInstructorInteractive(instructorId,subjectId,groupId,departmentId){
try{
const instructor=this.instructors.find(i=>i.id===instructorId);
const subject=this.subjects.find(s=>s.id===subjectId);
const group=this.groups.find(g=>g.id===groupId);
const assignmentData={
instructorId:instructorId,
subjectId:subjectId,
groupId:groupId,
departmentId:departmentId
};
const response=await fetch('http://localhost:5000/api/assignments',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify(assignmentData)
});
if(response.ok){
alert(`Назначение создано:${instructor.surname}${instructor.name}→${subject.name}→${group.number}`);
await this.loadAssignments();
}else{
alert('Ошибка при создании назначения');
}
}catch(error){
console.error('Ошибка назначения:',error);
alert('Ошибка при создании назначения');
}
}
fixEncoding(text) {
    if (!text) return text;
    const win1251ToUtf8 = {
        'Ђ': 'Ђ', 'Ѓ': 'Ѓ', '‚': '‚', 'ѓ': 'ѓ', '„': '„', '…': '…', '†': '†', '‡': '‡',
        '€': '€', '‰': '‰', 'Љ': 'Љ', '‹': '‹', 'Њ': 'Њ', 'Ќ': 'Ќ', 'Ћ': 'Ћ', 'Џ': 'Џ',
        'ђ': 'ђ', '‘': '‘', '’': '’', '“': '“', '”': '”', '•': '•', '–': '–', '—': '—',
        '�': '�', '™': '™', 'љ': 'љ', '›': '›', 'њ': 'њ', 'ќ': 'ќ', 'ћ': 'ћ', 'џ': 'џ',
        'Ў': 'Ў', 'ў': 'ў', 'Ј': 'Ј', '¤': '¤', 'Ґ': 'Ґ', '¦': '¦', '§': '§', 'Ё': 'Ё',
        '©': '©', 'Є': 'Є', '«': '«', '¬': '¬', '­': '­', '®': '®', 'Ї': 'Ї', '°': '°',
        '±': '±', 'І': 'І', 'і': 'і', 'ґ': 'ґ', 'µ': 'µ', '¶': '¶', '·': '·', 'ё': 'ё',
        '№': '№', 'є': 'є', '»': '»', 'ј': 'ј', 'Ѕ': 'Ѕ', 'ѕ': 'ѕ', 'ї': 'ї', 'А': 'А',
        'Б': 'Б', 'В': 'В', 'Г': 'Г', 'Д': 'Д', 'Е': 'Е', 'Ж': 'Ж', 'З': 'З', 'И': 'И',
        'Й': 'Й', 'К': 'К', 'Л': 'Л', 'М': 'М', 'Н': 'Н', 'О': 'О', 'П': 'П', 'Р': 'Р',
        'С': 'С', 'Т': 'Т', 'У': 'У', 'Ф': 'Ф', 'Х': 'Х', 'Ц': 'Ц', 'Ч': 'Ч', 'Ш': 'Ш',
        'Щ': 'Щ', 'Ъ': 'Ъ', 'Ы': 'Ы', 'Ь': 'Ь', 'Э': 'Э', 'Ю': 'Ю', 'Я': 'Я', 'а': 'а',
        'б': 'б', 'в': 'в', 'г': 'г', 'д': 'д', 'е': 'е', 'ж': 'ж', 'з': 'з', 'и': 'и',
        'й': 'й', 'к': 'к', 'л': 'л', 'м': 'м', 'н': 'н', 'о': 'о', 'п': 'п', 'р': 'р',
        'с': 'с', 'т': 'т', 'у': 'у', 'ф': 'ф', 'х': 'х', 'ц': 'ц', 'ч': 'ч', 'ш': 'ш',
        'щ': 'щ', 'ъ': 'ъ', 'ы': 'ы', 'ь': 'ь', 'э': 'э', 'ю': 'ю', 'я': 'я'
    };   
    return text.split('').map(char => win1251ToUtf8[char] || char).join('');
}
}
const adminApp=new AdminApp();
window.adminApp=adminApp;