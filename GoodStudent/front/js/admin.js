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
async loadAdminData() {
    try {
        console.log('Загружаем данные для админки из всех источников');
        const [students, groups, instructors, subjects] = await Promise.all([
            apiClient.getAllStudents(),
            apiClient.getAllGroups(), 
            apiClient.getAllInstructors(),
            apiClient.getAllSubjects()
        ]);
        const [departments, faculties, professions] = await Promise.all([
            apiClient.getCSharpDepartments(),
            apiClient.getCSharpFaculties(),
            apiClient.getCSharpProfessions()
        ]);
        this.students = students || [];
        this.groups = groups || [];
        this.instructors = instructors || [];
        this.subjects = subjects || [];
        this.departments = departments || [];
        this.faculties = faculties || [];
        this.professions = professions || [];       
        this.filteredStudents = [...this.students];        
        console.log('Данные загружены:', {
            students: this.students.length,
            groups: this.groups.length, 
            instructors: this.instructors.length,
            departments: this.departments.length,
            faculties: this.faculties.length,
            professions: this.professions.length
        });        
        this.populateAssignmentSelectors();
        this.updateStats();
        this.renderDataTable();
        this.showDataLoadedNotification();
    } catch (error) {
        console.error('Ошибка загрузки данных админки:', error);
        this.useDemoData();
    }
}
showDataLoadedNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
    `;
    notification.textContent = `Данные загружены: ${this.students.length} студентов, ${this.departments.length} кафедр`;
    document.body.appendChild(notification);    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
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
const assignment=this.assignments.find(a=>a.group_id===groupId);
return assignment?`${assignment.instructor_surname} ${assignment.instructor_name}`:'Не назначен';
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
}).join('');
}
populateAssignmentSelectors() {
    // 1. Селектор преподавателей (из Node.js БД)
    const instructorSelect = document.getElementById('instructor-select');
    if (instructorSelect) {
        instructorSelect.innerHTML = '<option value="">Выберите преподавателя</option>';
        this.instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = `${instructor.surname} ${instructor.name} ${instructor.patronymic || ''}`;
            instructorSelect.appendChild(option);
        });
        console.log('Загружено преподавателей:', this.instructors.length);
    }
    // 2. Селектор предметов (из Node.js БД)
    const subjectSelect = document.getElementById('subject-assign-select');
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">Выберите предмет</option>';
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = `${subject.name} (${subject.type || 'Не указан'})`;
            subjectSelect.appendChild(option);
        });
        console.log('Загружено предметов:', this.subjects.length);
    }
    // 3. Селектор групп (из Node.js БД)
    const groupAssignSelect = document.getElementById('group-assign-select');
    if (groupAssignSelect) {
        groupAssignSelect.innerHTML = '<option value="">Выберите группу</option>';
        this.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.number;
            option.title = `ID: ${group.id}`;
            groupAssignSelect.appendChild(option); 
        });
        console.log('Загружено групп:', this.groups.length);
    }
    // 4. Селектор кафедр (из C# API)
    const departmentSelect = document.getElementById('department-select');
    if (departmentSelect) {
        departmentSelect.innerHTML = '<option value="">Выберите кафедру</option>';
        
        if (this.departments && this.departments.length > 0) {
            this.departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                // Используем tittle из C# API или name как fallback
                const displayName = dept.tittle || dept.name || 'Без названия';
                const description = dept.description ? ` - ${dept.description}` : '';
                option.textContent = displayName + description;
                option.title = dept.description || displayName;
                departmentSelect.appendChild(option);
            });
            console.log('Загружено кафедр из C# API:', this.departments.length);
        } else {
            // Fallback - кафедры из Node.js БД
            const nodeJsDepartments = this.getFallbackDepartments();
            nodeJsDepartments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.tittle || dept.name;
                departmentSelect.appendChild(option);
            });
            console.log('Используются кафедры из Node.js БД:', nodeJsDepartments.length);
        }
    }
    // 5. Селектор факультетов (из C# API) - если есть в интерфейсе
    const facultySelect = document.getElementById('faculty-select');
    if (facultySelect) {
        facultySelect.innerHTML = '<option value="">Выберите факультет</option>';
        if (this.faculties && this.faculties.length > 0) {
            this.faculties.forEach(faculty => {
                const option = document.createElement('option');
                option.value = faculty.id;
                option.textContent = faculty.tittle || faculty.name || 'Без названия';
                facultySelect.appendChild(option);
            });
            console.log('Загружено факультетов:', this.faculties.length);
        }
    }
    // 6. Селектор специальностей (из C# API) - если есть в интерфейсе
    const professionSelect = document.getElementById('profession-select');
    if (professionSelect) {
        professionSelect.innerHTML = '<option value="">Выберите специальность</option>';
        if (this.professions && this.professions.length > 0) {
            this.professions.forEach(profession => {
                const option = document.createElement('option');
                option.value = profession.id;
                const displayName = profession.tittle || profession.name || 'Без названия';
                const code = profession.code ? ` (${profession.code})` : '';
                option.textContent = displayName + code;
                professionSelect.appendChild(option);
            });
            console.log('Загружено специальностей:', this.professions.length);
        }
    }
    // 7. Обновляем фильтры в таблице студентов
    this.updateTableFilters();
}
// Вспомогательный метод для обновления фильтров в таблице
updateTableFilters() {
    // Фильтр по группам в таблице
    const groupFilter = document.getElementById('group-filter');
    if (groupFilter) {
        const currentValue = groupFilter.value;
        groupFilter.innerHTML = '<option value="all">Все группы</option>';
        this.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.number;
            groupFilter.appendChild(option);
        });
        // Восстанавливаем выбранное значение
        groupFilter.value = currentValue;
    }
    // Фильтр по преподавателям в таблице
    const instructorFilter = document.getElementById('instructor-filter');
    if (instructorFilter) {
        const currentValue = instructorFilter.value;
        instructorFilter.innerHTML = '<option value="all">Все преподаватели</option>';
        this.instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = `${instructor.surname} ${instructor.name}`;
            instructorFilter.appendChild(option);
        });
        // Восстанавливаем выбранное значение
        instructorFilter.value = currentValue;
    }
    // Обновляем column filters в таблице
    const groupColumnFilter = document.querySelector('.column-filter[onchange*="group"]');
    if (groupColumnFilter) {
        groupColumnFilter.innerHTML = '<option value="all">Все группы</option>';
        this.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.number;
            groupColumnFilter.appendChild(option);
        });
    }
    const instructorColumnFilter = document.querySelector('.column-filter[onchange*="instructor"]');
    if (instructorColumnFilter) {
        instructorColumnFilter.innerHTML = '<option value="all">Все преподаватели</option>';
        this.instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            option.textContent = `${instructor.surname} ${instructor.name}`;
            instructorColumnFilter.appendChild(option);
        });
    }
}
// populateAssignmentSelectors(){
// const instructorSelect=document.getElementById('instructor-select');
// const subjectSelect=document.getElementById('subject-assign-select');
// const groupAssignSelect=document.getElementById('group-assign-select');
// const departmentSelect=document.getElementById('department-select');
// if(instructorSelect){
// instructorSelect.innerHTML='<option value="">Выберите преподавателя</option>';
// this.instructors.forEach(instructor=>{
// const option=document.createElement('option');
// option.value=instructor.id;
// option.textContent=`${instructor.surname} ${instructor.name}`;
// instructorSelect.appendChild(option);
// });
// }
// if(subjectSelect){
// subjectSelect.innerHTML='<option value="">Выберите предмет</option>';
// this.subjects.forEach(subject=>{
// const option=document.createElement('option');
// option.value=subject.id;
// option.textContent=subject.name;
// subjectSelect.appendChild(option);
// });
// }
// if(groupAssignSelect){
// groupAssignSelect.innerHTML='<option value="">Выберите группу</option>';
// this.groups.forEach(group=>{
// const option=document.createElement('option');
// option.value=group.id;
// option.textContent=group.number;
// groupAssignSelect.appendChild(option);
// });
// }
// if(departmentSelect){
// departmentSelect.innerHTML='<option value="">Выберите кафедру</option>';
// this.departments.forEach(dept=>{
// const option=document.createElement('option');
// option.value=dept.id;
// option.textContent=dept.tittle||dept.name;
// departmentSelect.appendChild(option);
// });
// }
// }

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
departmentId:departmentId
};
const response=await fetch('http://localhost:5000/api/assignments',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify(assignmentData)
});
if(response.ok){
const result=await response.json();
alert(`Предмет "${subject.name}" успешно назначен преподавателю ${instructor.surname} ${instructor.name} для группы ${group.number}`);
await this.loadAssignments();
this.clearAssignmentForm();
this.renderDataTable();
}else{
const errorData=await response.json();
if(errorData.existingId){
alert('Такое назначение уже существует');
}else{
alert('Ошибка при назначении предмета');
}
}
}catch(error){
console.error('Ошибка назначения предмета:',error);
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
<p><strong>Преподаватель:</strong> ${assignment.instructor_surname} ${assignment.instructor_name}</p>
<p><strong>Группа:</strong> ${assignment.group_number}</p>
<p><strong>Кафедра:</strong> ${assignment.department_name}</p>
<small>Назначено: ${new Date(assignment.created_at).toLocaleDateString('ru-RU')}</small>
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
alert('Ошибка при сохранении данных: '+error.message);
}
}
resetUploadForm(){
const uploadArea=document.getElementById('upload-area');
if(uploadArea){
uploadArea.innerHTML=`
<div class="upload-placeholder">
<div class="upload-icon"></div>
<p>Перетащите Excel файл сюда или нажмите для выбора</p>
<small>Поддерживаются файлы .xlsx, .xls</small>
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
updateStats() {
    const totalStudents = document.getElementById('total-students');
    const totalGroups = document.getElementById('total-groups');
    const totalTeachers = document.getElementById('total-teachers');
    const totalAssignments = document.getElementById('total-assignments');
    const totalDepartments = document.getElementById('total-departments');
    const totalFaculties = document.getElementById('total-faculties');
    if (totalStudents) totalStudents.textContent = this.students.length;
    if (totalGroups) totalGroups.textContent = this.groups.length;
    if (totalTeachers) totalTeachers.textContent = this.instructors.length;
    if (totalAssignments) totalAssignments.textContent = this.assignments.length;
    if (totalDepartments) totalDepartments.textContent = this.departments.length;
    if (totalFaculties) totalFaculties.textContent = this.faculties.length;
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
// editStudent(studentId){
// alert('Редактирование студента будет доступно в следующей версии');
// }
// deleteStudent(studentId){
// if(confirm('Удалить этого студента?')){
// this.students=this.students.filter(s=>s.id!==studentId);
// this.filteredStudents=this.filteredStudents.filter(s=>s.id!==studentId);
// this.renderDataTable();
// this.updateStats();
// }
// }
editStudent(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;
    const newName = prompt('Имя:', student.name);
    const newSurname = prompt('Фамилия:', student.surname);
    const newPatronymic = prompt('Отчество:', student.patronymic || '');
    let groupOptions = this.groups.map(g => `${g.id}:${g.number}`).join('\n');
    const groupInput = prompt(`Группа (${groupOptions}):`, student.groupId);
    const statusInput = prompt('Статус (0-активный, 1-академ, 2-отчислен):', student.status);
    if (newName && newSurname) {
        const updateData = {
            name: newName,
            surname: newSurname,
            patronymic: newPatronymic,
            groupId: groupInput || student.groupId,
            status: parseInt(statusInput) || student.status
        };
        apiClient.updateStudent(studentId, updateData)
            .then(result => {
                if (result.success) {
                    Object.assign(student, updateData);
                    this.renderDataTable();
                    alert('Студент успешно обновлен!');
                } else {
                    alert('Ошибка при обновлении студента: ' + result.error);
                }
            })
            .catch(error => {
                alert('Ошибка при обновлении студента: ' + error.message);
            });
    }
}
deleteStudent(studentId) {
    if (confirm('Удалить этого студента?')) {
        this.students = this.students.filter(s => s.id !== studentId);
        this.filteredStudents = this.filteredStudents.filter(s => s.id !== studentId);
        this.renderDataTable();
        this.updateStats();
        alert('Студент удален (пока только локально)');
    }
}
////
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
getFallbackDepartments() {
    return [
        { id: '1', tittle: 'Информационные системы', description: 'Кафедра информационных систем' },
        { id: '2', tittle: 'Программная инженерия', description: 'Кафедра программной инженерии' },
        { id: '3', tittle: 'Компьютерная безопасность', description: 'Кафедра компьютерной безопасности' },
        { id: '4', tittle: 'Прикладная математика', description: 'Кафедра прикладной математики' },
        { id: '5', tittle: 'Системный анализ', description: 'Кафедра системного анализа' }
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
}
const adminApp=new AdminApp();
window.adminApp=adminApp;