class ApiClient {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
        this.createdStudents = [];
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        console.log(`Node.js API: ${options.method || 'GET'} ${url}`);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                ...options
            };
            if (['POST', 'PUT', 'PATCH'].includes(options.method) && options.body) {
                config.body = JSON.stringify(options.body);
            }
            const response = await fetch(url, config);
            if (!response.ok) {
                if (response.status === 500) {
                    throw new Error('Внутренняя ошибка сервера. Попробуйте позже.');
                } else {
                    throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
                }
            }
            const data = await response.json();
            console.log(`API Success:`, data);
            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error.message);
            if (error.message.includes('Failed to fetch') || error.message.includes('Внутренняя ошибка')) {
                throw new Error('Сервер недоступен. Проверьте подключение и попробуйте позже.');
            }
            throw error;
        }
    }
    async getAllStudents() {
        try {
            console.log('Запрос всех студентов из PostgreSQL...');
            const students = await this.request('/students');
            return students;
        } catch (error) {
            console.error('Ошибка загрузки студентов:', error.message);
            return this.getFallbackStudents();
        }
    }
    async getAllGroups() {
        try {
            console.log('Запрос всех групп из PostgreSQL...');
            const groups = await this.request('/groups');
            return groups;
        } catch (error) {
            console.error('Ошибка загрузки групп:', error.message);
            return this.getFallbackGroups();
        }
    }
    async getAllSubjects() {
        try {
            console.log('Запрос всех предметов...');
            const subjects = await this.request('/subjects');
            return subjects;
        } catch (error) {
            console.error('Ошибка загрузки предметов:', error.message);
            return [
                { id: 1, name: 'Программирование' },
                { id: 2, name: 'Базы данных' },
                { id: 3, name: 'Веб-разработка' },
                { id: 4, name: 'Математика' }
            ];
        }
    }
    getFallbackStudents() {
        return [
            { id: '1', name: 'Иван', surname: 'Иванов', patronymic: 'Иванович', groupId: '1', groupNumber: '231-324' },
            { id: '2', name: 'Мария', surname: 'Петрова', patronymic: 'Сергеевна', groupId: '1', groupNumber: '231-324' },
            { id: '3', name: 'Сергей', surname: 'Сидоров', patronymic: 'Алексеевич', groupId: '2', groupNumber: '231-325' }
        ];
    }
    getFallbackGroups() {
        return [
            { id: '1', number: '231-324' },
            { id: '2', number: '231-325' },
            { id: '3', number: '231-326' }
        ];
    }
    async getStudentById(id) {
        return await this.request(`/students/${id}`);
    }
    async createStudent(studentData) {
        const requestData = {
            name: studentData.name,
            surname: studentData.surname,
            patronymic: studentData.patronymic || null,
            startYear: studentData.startYear || new Date().getFullYear(),
            groupId: studentData.groupId || studentData.group?.id || null
        };
        console.log('Создание студента в PostgreSQL:', requestData);
        const result = await this.request('/students', {
            method: 'POST',
            body: requestData
        });
        const createdStudent = {
            id: result,
            ...studentData
        };
        this.createdStudents.push(createdStudent);
        return result;
    }
    async getGroupById(id) {
        return await this.request(`/groups/${id}`);
    }
    async getGroupStudents(groupId) {
        try {
            console.log(`👥 Запрос студентов группы ${groupId} из PostgreSQL...`);
            const data = await this.request(`/groups/${groupId}/students`);
            return data;
        } catch (error) {
            console.error(`Ошибка загрузки студентов группы ${groupId}:`, error);
            return {
                group: { id: groupId, number: this.getGroupNameById(groupId) },
                students: []
            };
        }
    }
    async createGroup(groupData) {
        const requestData = {
            number: groupData.number,
            professionId: groupData.professionId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        };
        return await this.request('/groups', {
            method: 'POST',
            body: requestData
        });
    }
    async getAllInstructors() {
        try {
            console.log('Запрос всех преподавателей...');
            return await this.request('/instructors');
        } catch (error) {
            console.error('Ошибка загрузки преподавателей:', error);
            return this.getFallbackInstructors();
        }
    }
    async markAttendance(attendanceData) {
        try {
            console.log('Сохранение посещаемости в базу...');
            
            const requestData = {
                date: attendanceData.date,
                subject: attendanceData.subject,
                group: attendanceData.group,
                presentStudents: attendanceData.presentStudents || [],
                absentStudents: attendanceData.absentStudents || [],
                presentCount: attendanceData.presentCount,
                totalCount: attendanceData.totalCount
            };
            const result = await this.request('/attendance', {
                method: 'POST',
                body: requestData
            });
            return result;
        } catch (error) {
            console.error('Ошибка сохранения посещаемости:', error);
            return this.saveAttendanceToLocalStorage(attendanceData);
        }
    }
    saveAttendanceToLocalStorage(attendanceData) {
        const key = `attendance_${new Date().toISOString().split('T')[0]}_${Date.now()}`;
        const savedData = {
            ...attendanceData,
            savedAt: new Date().toISOString(),
            id: key,
            source: 'localstorage'
        };        
        localStorage.setItem(key, JSON.stringify(savedData));        
        const allAttendance = JSON.parse(localStorage.getItem('all_attendance') || '[]');
        allAttendance.push(savedData);
        localStorage.setItem('all_attendance', JSON.stringify(allAttendance));        
        return {
            success: true,
            message: `Посещаемость сохранена локально: ${attendanceData.presentCount} из ${attendanceData.totalCount} студентов`,
            data: savedData,
            id: key
        };
    }
    async getAttendanceHistory() {
        try {
            return await this.request('/attendance');
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            return JSON.parse(localStorage.getItem('all_attendance') || '[]');
        }
    }
    async createStudentsFromExcel(excelStudents) {
        const results = [];
        const groupsMap = new Map();
        try {
            const existingGroups = await this.getAllGroups();
            existingGroups.forEach(group => groupsMap.set(group.number, group));
        } catch (error) {
            console.warn('Не удалось загрузить группы, создаем новые...');
        }        
        for (const excelStudent of excelStudents) {
            try {
                let targetGroup = groupsMap.get(excelStudent.group);                
                if (!targetGroup) {
                    try {
                        const groupId = await this.createGroup({
                            number: excelStudent.group,
                            professionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6"
                        });
                        targetGroup = { id: groupId, number: excelStudent.group };
                        groupsMap.set(excelStudent.group, targetGroup);
                        console.log(`Создана новая группа: ${excelStudent.group}`);
                    } catch (error) {
                        console.error(`Ошибка создания группы ${excelStudent.group}:`, error);
                        targetGroup = {
                            id: this.generateUUID(),
                            number: excelStudent.group
                        };
                        groupsMap.set(excelStudent.group, targetGroup);
                    }
                }                
                const studentData = {
                    name: excelStudent.name,
                    surname: excelStudent.surname,
                    patronymic: excelStudent.patronymic || '',
                    startYear: 2024,
                    groupId: targetGroup.id
                };                
                const result = await this.createStudent(studentData);                
                results.push({
                    success: true,
                    student: excelStudent.fullName,
                    id: result,
                    group: targetGroup.number
                });               
                console.log(`Создан студент: ${excelStudent.fullName} в группе ${targetGroup.number}`);
                await new Promise(resolve => setTimeout(resolve, 100));
                
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
    async saveExcelData(excelData) {
        try {
            console.log('Сохранение Excel данных в базу...');
            const result = await this.request('/save-excel-data', {
                method: 'POST',
                body: excelData
            });
            return result;
        } catch (error) {
            console.error('Ошибка сохранения Excel данных:', error);
            throw error;
        }
    }
    getGroupNameById(groupId) {
        const groupMap = {
            'b8f78604-7d47-4eb0-9389-6b8eaaa1653b': '231-324',
            '137b8ecb-402d-41fe-979d-3bb5fd02e7c2': '231-325',
            '73c75851-f1cb-48ce-8c15-af9f4c36f201': '231-326'
        };
        return groupMap[groupId] || `Группа ${groupId}`;
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    async testAllEndpoints() {
        console.log('ТЕСТИРУЕМ ВСЕ ЭНДПОИНТЫ');
        
        const endpoints = [
            { name: 'Все студенты', url: '/students', method: 'GET' },
            { name: 'Все группы', url: '/groups', method: 'GET' },
            { name: 'Все преподаватели', url: '/instructors', method: 'GET' },
            { name: 'Все предметы', url: '/subjects', method: 'GET' },
            { name: 'Диагностика базы', url: '/debug/database', method: 'GET' }
        ];
        const results = [];
        for (const endpoint of endpoints) {
            try {
                console.log(`\nТестируем: ${endpoint.name} (${endpoint.url})`);
                const startTime = Date.now();                
                const data = await this.request(endpoint.url);
                const responseTime = Date.now() - startTime;                
                const result = {
                    name: endpoint.name,
                    url: endpoint.url,
                    status: 'УСПЕХ',
                    responseTime: `${responseTime}ms`,
                    dataLength: Array.isArray(data) ? data.length : 'object',
                    sample: Array.isArray(data) && data.length > 0 ? data[0] : data
                };                
                results.push(result);
                console.log(`${endpoint.name}: ${Array.isArray(data) ? data.length + ' записей' : 'Данные получены'} (${responseTime}ms)`);
                
            } catch (error) {
                const result = {
                    name: endpoint.name,
                    url: endpoint.url,
                    status: 'ОШИБКА',
                    error: error.message
                };
                
                results.push(result);
                console.log(`${endpoint.name}: ${error.message}`);
            }
        }
        console.log('\nРЕЗУЛЬТАТЫ ДИАГНОСТИКИ');
        results.forEach(result => {
            console.log(`${result.status} ${result.name}: ${result.responseTime || result.error}`);
        });
        return results;
    }
    getFallbackSubjects() {
        return [
            { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа' },
            { id: 2, name: 'Нормативное регулирование', type: 'Лекция' },
            { id: 3, name: 'Базы данных', type: 'Практика' }
        ];
    }
    getFallbackInstructors() {
        return [
            { id: 1, name: 'Иванов', surname: 'Петр', patronymic: 'Сергеевич' },
            { id: 2, name: 'Петрова', surname: 'Мария', patronymic: 'Ивановna' }
        ];
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
window.apiClient = apiClient;
console.log('API Client настроен для работы с PostgreSQL через Node.js');