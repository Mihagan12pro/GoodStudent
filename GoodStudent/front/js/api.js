class ApiClient {
    constructor() {
        this.baseUrl = 'https://localhost:7298/api';
        this.fallbackUrl = 'http://localhost:5000/api';
        this.useFallback = true;
    }
async updateDepartment(departmentId, data) {
    return await this.request(`/sections/Departments?DepartmentId=${departmentId}`, {
        method: 'PATCH',
        body: data
    });
}
async getDepartmentIds() {
    return await this.request('/sections/Departments/ids');
}
async createFaculty(data) {
    return await this.request('/sections/Faculty', {
        method: 'POST', 
        body: data
    });
}
async getFaculties() {
    return await this.request('/sections/Faculty');
}
async createInstructor(data) {
    return await this.request('/Instructors', {
        method: 'POST',
        body: data
    });
}
async updateInstructor(instructorId, data) {
    return await this.request(`/Instructors/update/${instructorId}`, {
        method: 'PATCH', 
        body: data
    });
}
async createProfession(data) {
    return await this.request('/sections/Professions', {
        method: 'POST',
        body: data
    });
}
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                ...options
            };
            if (['POST','PUT','PATCH'].includes(options.method)&&options.body){
                config.body=JSON.stringify(options.body);
            }
            const response=await fetch(url,config);
            if(!response.ok){
                throw new Error(`HTTP ${response.status}:${response.statusText}`);
            }
            return await response.json();
        }catch(error){
            throw error;
        }
    }   
    async requestFallback(endpoint,options={}){
        const url=`${this.fallbackUrl}${endpoint}`;
        try{
            const config={
                headers:{'Content-Type':'application/json','Accept':'application/json'},
                ...options
            };
            if(['POST','PUT','PATCH'].includes(options.method)&&options.body){
                config.body=JSON.stringify(options.body);
            }
            const response=await fetch(url,config);
            if(!response.ok){throw new Error(`HTTP ${response.status}:${response.statusText}`);}
            return await response.json();
        }catch(error){
            console.error(`Node.js API Error[${endpoint}]:`,error);
            throw error;
        }
    }
    async getAllStudents(){
        try{
            const response=await fetch(`${this.fallbackUrl}/students`);
            if(!response.ok)throw new Error('Failed to fetch students');
            return await response.json();
        }catch(error){
            console.log('Using fallback students data');
            return this.getFallbackStudents();
        }
    }
    async getAllGroups(){
        try{
            const response=await fetch(`${this.fallbackUrl}/groups`);
            if(!response.ok)throw new Error('Failed to fetch groups');
            return await response.json();
        }catch(error){
            console.log('Using fallback groups data');
            return this.getFallbackGroups();
        }
    }
   async getAllInstructors(){
  try{
    const response = await fetch(`${this.fallbackUrl}/instructors`);
    if(response.ok) return await response.json();
    throw new Error('Failed to fetch instructors');
  }catch(error){
    console.log('Using fallback instructors data');
    return this.getFallbackInstructors();
  }
}
    async getAllDepartments(){
  try{
    const response = await fetch(`${this.fallbackUrl}/departments`);
    if(response.ok) return await response.json();
    throw new Error('Failed to fetch departments');
  }catch(error){
    console.log('Using fallback departments data');
    return this.getFallbackDepartments();
  }
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
    async createStudent(studentData) {
        try {
            const response = await fetch(`${this.fallbackUrl}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            });            
            const result = await response.json();           
            if (!response.ok) {
                if (result.existingId) {
                    return { 
                        success: true, 
                        exists: true, 
                        existingId: result.existingId,
                        message: 'Студент уже существует'
                    };
                }
                throw new Error(result.error || 'Ошибка создания студента');
            }            
            return { success: true, id: result.id };
        } catch (error) {
            console.error('Ошибка создания студента:', error);
            return { success: false, error: error.message };
        }
    }
    async createGroup(groupData) {
    try {
        const cleanGroupData = {
            number: groupData.number
        };        
        const response = await fetch(`${this.fallbackUrl}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cleanGroupData)
        });       
        const result = await response.json();        
        if (!response.ok) {
            if (result.exists) {
                return { 
                    success: true, 
                    exists: true, 
                    id: result.id,
                    message: 'Группа уже существует'
                };
            }
            throw new Error(result.error || 'Ошибка создания группы');
        }        
        return { success: true, id: result.id };
    } catch (error) {
        console.error('Ошибка создания группы:', error);
        return { success: false, error: error.message };
    }
}
    async uploadExcelToBackend(excelStudents) {
        const results = [];
        for (const excelStudent of excelStudents) {
            try {
                console.log('Обработка студента:', excelStudent.fullName);                
                let groupId = await this.findOrCreateGroup(excelStudent.group);                
                const studentData = {
                    name: excelStudent.name,
                    surname: excelStudent.surname,
                    patronymic: excelStudent.patronymic || '',
                    startYear: 2024,
                    groupId: groupId,
                    status: 0
                };                
                const result = await this.createStudent(studentData);                
                if (result.success) {
                    results.push({
                        success: true,
                        student: excelStudent.fullName,
                        id: result.id,
                        group: excelStudent.group,
                        message: 'Успешно создан'
                    });
                } else if (result.exists) {
                    results.push({
                        success: true,
                        student: excelStudent.fullName,
                        id: result.existingId,
                        group: excelStudent.group,
                        message: 'Уже существует',
                        exists: true
                    });
                } else {
                    results.push({
                        success: false,
                        student: excelStudent.fullName,
                        error: result.error || 'Неизвестная ошибка'
                    });
                }
            } catch (error) {
                console.error('Ошибка при обработке студента:', excelStudent.fullName, error);
                results.push({
                    success: false,
                    student: excelStudent.fullName,
                    error: error.message
                });
            }
        }
        return results;
    }
    async findOrCreateGroup(groupNumber){
    try{
        const groups=await this.getAllGroups();
        const existingGroup=groups.find(g=>g.number===groupNumber);
        if(existingGroup){
            return existingGroup.id;
        }
        const result=await this.createGroup({
            number:groupNumber
        });        
        if(result.success){
            return result.id;
        }else{
            throw new Error(result.error);
        }
    }catch(error){
        console.error('Ошибка поиска/создания группы:',error);
        return null;
    }
}
    async getAllSubjects(){
  try{
    const response = await fetch(`${this.fallbackUrl}/subjects`);
    if(response.ok) return await response.json();
    throw new Error('Failed to fetch subjects');
  }catch(error){
    console.log('Using fallback subjects data');
    return this.getFallbackSubjects();
  }
}
    async assignSubjectToInstructor(assignmentData){
        return this.saveAssignmentToLocalStorage(assignmentData);
    }
    saveAssignmentToLocalStorage(assignmentData){
        const assignments=JSON.parse(localStorage.getItem('instructor_assignments')||'[]');
        const newAssignment={
            id:`assignment_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
            ...assignmentData,
            createdAt:new Date().toISOString()
        };
        assignments.push(newAssignment);
        localStorage.setItem('instructor_assignments',JSON.stringify(assignments));
        return{id:newAssignment.id,success:true};
    }
    async markAttendance(attendanceData){
        try{
            const response=await fetch(`${this.fallbackUrl}/attendance`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(attendanceData)
            });
            return await response.json();
        }catch(error){
            return{success:true,id:`attendance_${Date.now()}`};
        }
    }
    async getFullDepartments(){
try{
const response=await fetch(`${this.fallbackUrl}/departments-full`);
if(response.ok)return await response.json();
throw new Error('Failed to fetch departments');
}catch(error){
console.error('Ошибка загрузки кафедр:',error);
return[];
}
}
async getFullSubjects(){
try{
const response=await fetch(`${this.fallbackUrl}/subjects-full`);
if(response.ok)return await response.json();
throw new Error('Failed to fetch subjects');
}catch(error){
console.error('Ошибка загрузки предметов:',error);
return[];
}
}
async getFullFaculties(){
  try{
    const response = await fetch(`${this.fallbackUrl}/faculties-full`);
    if(response.ok) return await response.json();
    throw new Error('Failed to fetch faculties');
  }catch(error){
    console.log('Using fallback faculties data');
    return this.getFallbackFaculties();
  }
}
async getFullInstructors(){
try{
const response=await fetch(`${this.fallbackUrl}/instructors-full`);
if(response.ok)return await response.json();
throw new Error('Failed to fetch instructors');
}catch(error){
console.error('Ошибка загрузки преподавателей:',error);
return[];
}
}
getFallbackFaculties() {
  return [
    { id: '1', tittle: 'Факультет информационных технологий', description: 'ФИТ' },
    { id: '2', tittle: 'Факультет кибербезопасности', description: 'ФКБ' }
  ];
}
getFallbackSubjects() {
  return [
    { id: '1', name: 'Системы инженерного анализа', type: 'Лаб. работа', department_id: '1' },
    { id: '2', name: 'Базы данных', type: 'Лекция', department_id: '1' },
    { id: '3', name: 'Веб-программирование', type: 'Практика', department_id: '2' },
    { id: '4', name: 'Математический анализ', type: 'Лекция', department_id: '3' }
  ];
}
    async updateStudent(studentId, studentData) {
    try {
        const response = await fetch(`${this.fallbackUrl}/students/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });       
        if (!response.ok) {
            throw new Error('Ошибка обновления студента');
        }        
        return await response.json();
    } catch (error) {
        console.error('Ошибка обновления студента:', error);
        return { success: false, error: error.message };
    }
}
async updateGroup(groupId, groupData) {
    try {
        const response = await fetch(`${this.fallbackUrl}/groups/${groupId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
        });        
        if (!response.ok) {
            throw new Error('Ошибка обновления группы');
        }        
        return await response.json();
    } catch (error) {
        console.error('Ошибка обновления группы:', error);
        return { success: false, error: error.message };
    }
}
async getAllSubjectsFull() {
    return await this.request('/sections/Subjects'); 
}
async getCSharpSubjects() {
    try {
        const response = await fetch(`${this.fallbackUrl}/csharp/subjects`);
        if (response.ok) return await response.json();
        throw new Error('Failed to fetch subjects');
    } catch (error) {
        console.error('Ошибка загрузки предметов из C#:', error);
        return this.getFallbackSubjects();
    }
}
async getCSharpDepartments() {
    try {
        console.log('Загрузка кафедр через прокси...');
        const response = await fetch(`${this.fallbackUrl}/csharp/departments`);
        if (response.ok) {
            const departments = await response.json();
            console.log('Кафедры загружены:', departments);
            return departments;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
        console.error('Ошибка загрузки кафедр через прокси:', error);
        return this.getFallbackDepartments();
    }
}
async getCSharpFaculties() {
    try {
        const response = await fetch(`${this.fallbackUrl}/csharp/faculties`);
        if (response.ok) return await response.json();
        throw new Error('Failed to fetch faculties');
    } catch (error) {
        console.error('Ошибка загрузки факультетов:', error);
        return [];
    }
}
async getCSharpProfessions() {
    try {
        const response = await fetch(`${this.fallbackUrl}/csharp/professions`);
        if (response.ok) return await response.json();
        throw new Error('Failed to fetch professions');
    } catch (error) {
        console.error('Ошибка загрузки специальностей:', error);
        return [];
    }
}
getFallbackDepartments() {
    return [
        { id: '1', tittle: 'Информационные системы', description: 'Кафедра информационных систем' },
        { id: '2', tittle: 'Программная инженерия', description: 'Кафедра программной инженерии' },
        { id: '3', tittle: 'Компьютерная безопасность', description: 'Кафедра компьютерной безопасности' }
    ];
}
async getSectionsDepartments(){
try{
const response=await fetch(`${this.fallbackUrl}/sections/departments`);
if(response.ok)return await response.json();
throw new Error('Failed to fetch sections departments');
}catch(error){
console.error('Ошибка загрузки кафедр из sections:',error);
return[];
}
}
async getSectionsFaculties(){
try{
const response=await fetch(`${this.fallbackUrl}/sections/faculties`);
if(response.ok)return await response.json();
throw new Error('Failed to fetch sections faculties');
}catch(error){
console.error('Ошибка загрузки факультетов из sections:',error);
return[];
}
}
async getCSharpInstructors(){
try{
const response=await fetch(`${this.fallbackUrl}/instructors/all`);
if(response.ok)return await response.json();
throw new Error('Failed to fetch C# instructors');
}catch(error){
console.error('Ошибка загрузки преподавателей из C#:',error);
return[];
}
}
}
const apiClient=new ApiClient();
window.apiClient=apiClient;