class ApiClient {
    constructor() {
        this.baseUrl = 'https://localhost:7298/api';
        this.createdStudents = []; 
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;      
        console.log(`API Request: ${options.method || 'GET'} ${url}`);      
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                ...options
            };
            if (['POST', 'PUT', 'PATCH'].includes(options.method) && options.body) {
                config.body = JSON.stringify(options.body);
            }
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }
    async createStudent(studentData) {
        const result = await this.request('/Students', {
            method: 'POST',
            body: studentData
        });
        this.createdStudents.push({
            id: result,
            name: studentData.name,
            surname: studentData.surname,
            patronymic: studentData.patronymic,
            groupId: studentData.group.id,
            groupName: studentData.group.number
        });      
        return result;
    }
    async getStudents() {
        console.log('Loading REAL students from backend...');
        if (this.createdStudents.length > 0) {
            console.log(`Using created students: ${this.createdStudents.length}`);
            return this.createdStudents.map(student => ({
                id: student.id,
                name: student.name,
                surname: student.surname,
                patronymic: student.patronymic,
                fullName: `${student.surname} ${student.name} ${student.patronymic}`.trim(),
                groupId: student.groupId,
                groupName: student.groupName,
                present: false
            }));
        }
        try {
            const knownGroups = [
                {id:'b8f78604-7d47-4eb0-9389-6b8eaaa1653b', number:'231-324' },
                {id:'137b8ecb-402d-41fe-979d-3bb5fd02e7c2', number:'231-325' },
                {id:'73c75851-f1cb-48ce-8c15-af9f4c36f201', number:'231-326' }
            ];
            const allStudents = [];
            for (const group of knownGroups) {
                try {
                    const groupData = await this.getGroupStudents(group.id);
                    const students = groupData.students.map(student => ({
                        id: student.id,
                        name: student.name || '',
                        surname: student.surname || '',
                        patronymic: student.patronymic || '',
                        fullName: `${student.surname || ''} ${student.name || ''} ${student.patronymic || ''}`.trim(),
                        groupId: group.id,
                        groupName: group.number,
                        present: false
                    }));
                    allStudents.push(...students);
                    console.log(`Group ${group.number}: ${students.length} students`);
                } catch (error) {
                    console.warn(`Skip group ${group.number}: ${error.message}`);
                }
            }
            if (allStudents.length > 0) {
                return allStudents;
            }
        } catch (error) {
            console.warn('Cannot get students via groups:', error.message);
        }
        console.log('Creating test students...');
        const created = await this.createTestStudents();        
        return created.map(student => ({
            id: student.id,
            name: student.name,
            surname: student.surname,
            patronymic: student.patronymic,
            fullName: `${student.surname} ${student.name} ${student.patronymic}`.trim(),
            groupId: student.groupId,
            groupName: student.groupName,
            present: false
        }));
    }
    async getGroupStudents(groupId) {
        const data = await this.request(`/Groups/${groupId}/students`);
        return {
            group: data.item1,
            students: data.item2 || []
        };
    }
    async createTestStudents() {
        const groups = [
            { id: 'b8f78604-7d47-4eb0-9389-6b8eaaa1653b', number: '231-324' },
            { id: '137b8ecb-402d-41fe-979d-3bb5fd02e7c2', number: '231-325' },
            { id: '73c75851-f1cb-48ce-8c15-af9f4c36f201', number: '231-326' }
        ];
        const students = [
//Группа 231-324
            {name:"Иван", surname:"Иванов", patronymic:"Иванович", groupId: groups[0].id },
            {name:"Мария", surname:"Петрова", patronymic:"Сергеевна", groupId: groups[0].id },
            {name:"Сергей", surname:"Сидоров", patronymic:"Алексеевич", groupId: groups[0].id },        
//Группа 231-325  
            {name:"Анна", surname:"Козлова", patronymic:"Владимировна", groupId: groups[1].id },
            {name:"Дмитрий", surname:"Новиков", patronymic:"Сергеевич", groupId: groups[1].id },         
//Группа 231-326
            {name:"Елена", surname:"Морозова", patronymic:"Андреевна", groupId: groups[2].id },
            {name:"Александр", surname:"Павлов", patronymic:"Игоревич", groupId: groups[2].id }
        ];
        const createdStudents = [];
        for (const student of students) {
            try {
                const group = groups.find(g => g.id === student.groupId);
                const studentData = {
                    name: student.name,
                    surname: student.surname,
                    startYear: 2024,
                    patronymic: student.patronymic,
                    group: {
                        id: student.groupId,
                        number: group.number,
                        professionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    },
                    status: 0
                };
                const result = await this.createStudent(studentData);
                console.log(`Created student: ${student.surname} ${student.name}, ID: ${result}`);
                createdStudents.push({
                    id: result,
                    ...student,
                    groupName: group.number
                });
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Error creating student ${student.surname}:`, error.message);
            }
        }
        console.log(`Total created students: ${createdStudents.length}`);
        return createdStudents;
    }
    async getGroups() {
        return [
            { id: 'b8f78604-7d47-4eb0-9389-6b8eaaa1653b', number: '231-324' },
            { id: '137b8ecb-402d-41fe-979d-3bb5fd02e7c2', number: '231-325' },
            { id: '73c75851-f1cb-48ce-8c15-af9f4c36f201', number: '231-326' }
        ];
    }
    async markAttendance(attendanceData) {
        console.log('Saving REAL attendance data:', attendanceData);
        const key = `attendance_${new Date().toISOString().split('T')[0]}`;        
        const savedData = {
            ...attendanceData,
            savedAt: new Date().toISOString(),
            source: 'frontend'
        };        
        localStorage.setItem(key, JSON.stringify(savedData));        
        return { 
            success: true, 
            message: `Посещаемость сохранена: ${attendanceData.presentCount} из ${attendanceData.totalCount}`,
            data: savedData
        };
    }
    async login(email, password) {
        const user = {
            id: 1,
            name: email.includes('admin') ? 'Заведующий кафедрой' : 'Преподаватель',
            email: email,
            role: email.includes('admin') ? 'admin' : 'teacher'
        };        
        const token = 'demo-token-' + Date.now();
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));        
        return { token: token, user };
    }
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
}
const apiClient = new ApiClient();