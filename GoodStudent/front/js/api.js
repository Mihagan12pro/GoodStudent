class ApiClient {
    constructor() {
        this.baseUrl = 'https://localhost:7298/api';
        this.fallbackUrl = 'http://localhost:5000/api';
        this.useFallback = true;
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
        return this.getFallbackInstructors();
    }

    async getAllDepartments(){
        return this.getFallbackDepartments();
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

    async createStudent(studentData){
        try{
            const response=await fetch(`${this.fallbackUrl}/students`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(studentData)
            });
            return await response.json();
        }catch(error){
            return{id:`student_${Date.now()}`,success:true};
        }
    }

    async createGroup(groupData){
        try{
            const response=await fetch(`${this.fallbackUrl}/groups`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(groupData)
            });
            return await response.json();
        }catch(error){
            return{id:`group_${Date.now()}`,success:true};
        }
    }

    async uploadExcelToBackend(excelStudents){
        const results=[];
        for(const excelStudent of excelStudents){
            try{
                let groupId=await this.findOrCreateGroup(excelStudent.group);
                const studentData={
                    name:excelStudent.name,
                    surname:excelStudent.surname,
                    patronymic:excelStudent.patronymic||'',
                    startYear:2024,
                    groupId:groupId,
                    status:0
                };
                const result=await this.createStudent(studentData);
                results.push({
                    success:true,
                    student:excelStudent.fullName,
                    id:result,
                    group:excelStudent.group
                });
            }catch(error){
                results.push({
                    success:false,
                    student:excelStudent.fullName,
                    error:error.message
                });
            }
        }
        return results;
    }

    async findOrCreateGroup(groupNumber){
        try{
            const groups=await this.getAllGroups();
            const existingGroup=groups.find(g=>g.number===groupNumber);
            if(existingGroup){return existingGroup.id;}
            const newGroupId=await this.createGroup({
                number:groupNumber,
                professionId:"1"
            });
            return newGroupId;
        }catch(error){
            return`group_${Date.now()}`;
        }
    }

    async getAllSubjects(){
        try{
            const response=await fetch(`${this.fallbackUrl}/subjects`);
            if(!response.ok)throw new Error('Failed to fetch subjects');
            return await response.json();
        }catch(error){
            return[
                {id:1,name:'Системы инженерного анализа',type:'Лаб. работа'},
                {id:2,name:'Нормативное регулирование',type:'Лекция'},
                {id:3,name:'Базы данных',type:'Практика'},
                {id:4,name:'Веб-программирование',type:'Лаб. работа'},
                {id:5,name:'Математика',type:'Лекция'},
                {id:6,name:'Программирование',type:'Лаб. работа'}
            ];
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
}

const apiClient=new ApiClient();
window.apiClient=apiClient;