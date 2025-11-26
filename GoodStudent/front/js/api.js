class ApiClient {
    constructor() {
        this.baseUrl = 'https://localhost:7298/api';
        this.fallbackUrl = 'http://localhost:5000/api';
        this.useFallback = false;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`C# API: ${options.method || 'GET'} ${url}`);
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
            if(response.status===204){return null;}
            return await response.json();
        }catch(error){
            console.error(`C# API Error[${endpoint}]:`,error);
            if(!this.useFallback){
                console.log('Переключаемся на Node.js fallback');
                this.useFallback=true;
            }
            throw error;
        }
    }
    async requestFallback(endpoint,options={}){
        const url=`${this.fallbackUrl}${endpoint}`;
        console.log(`Node.js API:${options.method||'GET'}${url}`);
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
            if(this.useFallback){
                return await this.requestFallback('/students');
            }
            return await this.request('/Students');
        }catch(error){
            return await this.requestFallback('/students');
        }
    }
    async getAllGroups(){
        try{
            if(this.useFallback){
                return await this.requestFallback('/groups');
            }
            return await this.request('/Groups');
        }catch(error){
            return await this.requestFallback('/groups');
        }
    }
    async getAllInstructors(){
        try{
            if(this.useFallback){
                return await this.requestFallback('/instructors');
            }
            return await this.request('/Instructors');
        }catch(error){
            return this.getFallbackInstructors();
        }
    }
    async getAllDepartments(){
        try{
            if(this.useFallback){
                return await this.requestFallback('/departments');
            }
            return await this.request('/sections/Departments');
        }catch(error){
            return this.getFallbackDepartments();
        }
    }
    getFallbackInstructors(){
        return[
            {id:'1',name:'Иванов',surname:'Петр',patronymic:'Сергеевич'},
            {id:'2',name:'Петрова',surname:'Мария',patronymic:'Ивановна'}
        ];
    }
    getFallbackDepartments(){
        return[
            {id:'1',tittle:'Информационные системы'},
            {id:'2',tittle:'Программная инженерия'}
        ];
    }
    async createStudent(studentData){
        try{
            if(this.useFallback){
                return await this.requestFallback('/students',{
                    method:'POST',
                    body:studentData
                });
            }
            return await this.request('/Students',{
                method:'POST',
                body:{
                    name:studentData.name,
                    surname:studentData.surname,
                    patronymic:studentData.patronymic||'',
                    startYear:studentData.startYear||new Date().getFullYear(),
                    groupId:studentData.groupId,
                    status:studentData.status||0
                }
            });
        }catch(error){
            return await this.requestFallback('/students',{
                method:'POST',
                body:studentData
            });
        }
    }
    async createGroup(groupData){
        try{
            if(this.useFallback){
                return await this.requestFallback('/groups',{
                    method:'POST',
                    body:groupData
                });
            }
            return await this.request('/Groups',{
                method:'POST',
                body:{
                    number:groupData.number,
                    professionId:groupData.professionId||"3fa85f64-5717-4562-b3fc-2c963f66afa6"
                }
            });
        }catch(error){
            return await this.requestFallback('/groups',{
                method:'POST',
                body:groupData
            });
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
                professionId:"3fa85f64-5717-4562-b3fc-2c963f66afa6"
            });
            return newGroupId;
        }catch(error){
            console.error('Ошибка создания группы:',error);
            throw error;
        }
    }
    async getAllSubjects(){
        try{
            return await this.requestFallback('/subjects');
        }catch(error){
            return[
                {id:1,name:'Системы инженерного анализа',type:'Лаб. работа'},
                {id:2,name:'Нормативное регулирование',type:'Лекция'},
                {id:3,name:'Базы данных',type:'Практика'}
            ];
        }
    }
}
const apiClient=new ApiClient();
window.apiClient=apiClient;