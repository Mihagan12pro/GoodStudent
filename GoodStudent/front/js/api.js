class ApiClient {
    constructor() {
        this.baseUrl = 'https://localhost:7298/api';
        this.createdStudents = []; 
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;        
        console.log(`${options.method || 'GET'} ${url}`);        
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
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Backend error [${endpoint}]: ${error.message}`);
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
    async getAllStudents() {
        if (this.createdStudents.length > 0) {
            console.log(`Используем созданных студентов: ${this.createdStudents.length}`);
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
                    console.log(`Группа ${group.number}: ${students.length} студентов`);
                } catch (error) {
                    console.warn(`Пропускаем группу ${group.number}: ${error.message}`);
                }
            }
            if (allStudents.length > 0) {
                return allStudents;
            }
        } catch (error) {
            console.warn('Не удалось получить студентов через группы:', error.message);
        }
        console.log('Создаем тестовых студентов');
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
            // Группа 231-324
            { name: "Иван", surname: "Иванов", patronymic: "Иванович", groupId: groups[0].id },
            { name: "Мария", surname: "Петрова", patronymic: "Сергеевна", groupId: groups[0].id },
            { name: "Сергей", surname: "Сидоров", patronymic: "Алексеевич", groupId: groups[0].id },
            
            // Группа 231-325  
            { name: "Анна", surname: "Козлова", patronymic: "Владимировна", groupId: groups[1].id },
            { name: "Дмитрий", surname: "Новиков", patronymic: "Сергеевич", groupId: groups[1].id },
            
            // Группа 231-326
            { name: "Елена", surname: "Морозова", patronymic: "Андреевна", groupId: groups[2].id },
            { name: "Александр", surname: "Павлов", patronymic: "Игоревич", groupId: groups[2].id }
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
                console.log(`Создан студент: ${student.surname} ${student.name}, ID: ${result}`);
                createdStudents.push({
                    id: result,
                    ...student,
                    groupName: group.number
                });
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Ошибка создания студента ${student.surname}:`, error.message);
            }
        }
        console.log(`Всего создано студентов: ${createdStudents.length}`);
        return createdStudents;
    }
    async markAttendance(attendanceData) {
        const key = `attendance_${new Date().toISOString().split('T')[0]}`;
        const savedData = {
            ...attendanceData,
            savedAt: new Date().toISOString(),
            source: 'frontend'
        };        
        localStorage.setItem(key, JSON.stringify(savedData));       
        try {
            console.log('Данные для отправки на бэкенд:', attendanceData);
        } catch (error) {
            console.log('Нет endpoint для посещаемости в бэкенде');
        }        
        return {
            success: true,
            message: `Посещаемость сохранена: ${attendanceData.presentCount} из ${attendanceData.totalCount} студентов`,
            data: savedData
        };
    }
    async getGroups() {
        return [
            {id:'b8f78604-7d47-4eb0-9389-6b8eaaa1653b', number: '231-324' },
            {id:'137b8ecb-402d-41fe-979d-3bb5fd02e7c2', number: '231-325' },
            {id:'73c75851-f1cb-48ce-8c15-af9f4c36f201', number: '231-326' }
        ];
    }
    async createStudentsFromExcel(excelStudents) {
        const results = [];
        
        for (const excelStudent of excelStudents) {
            try {
                const groups = await this.getGroups();
                let targetGroup = groups.find(g => g.number === excelStudent.group);
                
                if (!targetGroup) {
                    targetGroup = {
                        id: this.generateUUID(),
                        number: excelStudent.group
                    };
                }
                const studentData = {
                    name: excelStudent.name,
                    surname: excelStudent.surname,
                    patronymic: excelStudent.patronymic || '',
                    startYear: 2024,
                    group: {
                        id: targetGroup.id,
                        number: targetGroup.number,
                        professionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    },
                    status: 0
                };                
                const result = await this.createStudent(studentData);                
                results.push({
                    success: true,
                    student: excelStudent.fullName,
                    id: result,
                    group: targetGroup.number
                });                
                console.log(`Создан студент из Excel: ${excelStudent.fullName} в группе ${targetGroup.number}`);                
            } catch (error) {
                results.push({
                    success: false,
                    student: excelStudent.fullName,
                    error: error.message
                });
                console.error(`Ошибка создания студента ${excelStudent.fullName}:`, error);
            }
        }
        
        return results;
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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