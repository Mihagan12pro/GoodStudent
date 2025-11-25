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
//     async getAllStudents() {
//     try {
//         const allStudents = await this.request('/Students');
//         console.log(`Загружено студентов: ${allStudents.length}`);
        
//         return allStudents.map(student => ({
//             id: student.id,
//             name: student.name,
//             surname: student.surname,
//             patronymic: student.patronymic,
//             fullName: `${student.surname} ${student.name} ${student.patronymic}`.trim(),
//             groupId: student.groupId,
//             groupName: student.groupNumber,
//             present: false
//         }));
//     } catch (error) {
//         console.error('Ошибка загрузки студентов:', error);
//         return [];
//     }
// }
async getAllStudents() {
    console.log('=== ПОЛУЧАЕМ ВСЕХ СТУДЕНТОВ ИЗ БАЗЫ ===');    
    try {
        try {
            console.log('Пробуем endpoint /Students...');
            const allStudents = await this.request('/Students');
            console.log('Ответ от /Students:', allStudents);            
            if (allStudents && Array.isArray(allStudents) && allStudents.length > 0) {
                console.log(`Найдено студентов через /Students: ${allStudents.length}`);                
                return allStudents.map(student => ({
                    id: student.id || student.Id || this.generateUUID(),
                    name: student.name || '',
                    surname: student.surname || '',
                    patronymic: student.patronymic || '',
                    fullName: `${student.surname || ''} ${student.name || ''} ${student.patronymic || ''}`.trim(),
                    groupId: student.groupId || this.getGroupIdByNumber(student.groupNumber),
                    groupName: student.groupNumber || '231-324',
                    present: false
                }));
            }
        } catch (error) {
            console.log('/Students не работает:', error.message);
        }
        console.log('Получаем студентов через группы...');
        const groups = await this.getGroups();
        const studentsFromGroups = [];        
        for (const group of groups) {
            try {
                const groupData = await this.request(`/Groups/${group.id}/students`);
                console.log(`Группа ${group.number}:`, groupData);                
                if (groupData && groupData.students && Array.isArray(groupData.students)) {
                    const students = groupData.students.map(student => ({
                        id: student.id || student.Id || this.generateUUID(),
                        name: student.name || '',
                        surname: student.surname || '',
                        patronymic: student.patronymic || '',
                        fullName: `${student.surname || ''} ${student.name || ''} ${student.patronymic || ''}`.trim(),
                        groupId: group.id,
                        groupName: group.number,
                        present: false
                    }));
                    studentsFromGroups.push(...students);
                    console.log(`Группа ${group.number}: ${students.length} студентов`);
                }
            } catch (error) {
                console.warn(`Группа ${group.number}: ${error.message}`);
            }
        }
        if (studentsFromGroups.length > 0) {
            console.log(`Всего студентов из групп: ${studentsFromGroups.length}`);
            return studentsFromGroups;
        }
        console.log('Используем расширенный список ID...');
        const extendedStudentIds = [
            '29883b0c-6b9b-44ab-997e-8113a0a63c21', 'b6ec0b67-b3ac-4c93-becf-22aaa9546b79',
            '928348ec-9ebf-4cfa-bb27-2f6f94276c98', '6860a1b5-5bb4-4d28-9c8b-89bbab6c3477',
            'c6b104dd-bafd-48eb-ba2d-efa8109dc251', '34758362-09e2-4cda-a24f-7a7f9aca23b5',
            '5b88c9a3-6fdd-4ee0-ac39-4fac4bba73ee', '92bb2733-10ab-4735-8c7b-6866646441df',
            'ea32956a-6d37-481e-b82b-cb23def6c913', '55fe79d5-7610-4353-96c7-af69d57e2ee1',
            'edfca4fb-66af-49bf-b2b5-f5f350019811', '3dc07132-ceac-4e6c-8c7d-1ac972f65c2c',
            'ae146129-f173-4505-94f1-554fb9ed7481', 'dc09f97b-b812-456c-b768-a4a75a8df30e',
            '0bc87485-3630-4ba9-92c8-2a2ddb9dd02f', 'c24dca05-1550-4dcd-b5e4-8c42a28f72aa'
        ];
        const studentsById = [];        
        for (const id of extendedStudentIds) {
            try {
                const student = await this.request(`/Students/${id}`);
                if (student) {
                    const studentData = {
                        id: id,
                        name: student.name || '',
                        surname: student.surname || '',
                        patronymic: student.patronymic || '',
                        fullName: `${student.surname || ''} ${student.name || ''} ${student.patronymic || ''}`.trim(),
                        groupId: this.getGroupIdByNumber(student.groupNumber),
                        groupName: student.groupNumber || '231-324',
                        present: false
                    };
                    studentsById.push(studentData);
                }
            } catch (error) {
            }
        }       
        console.log(`Загружено студентов по ID: ${studentsById.length}`);
        return studentsById;
    } catch (error) {
        console.error('Ошибка загрузки всех студентов:', error);
        return [];
    }
}
getGroupIdByNumber(groupNumber) {
    const groupMap = {
        '231-324': 'b8f78604-7d47-4eb0-9389-6b8eaaa1653b',
        '231-325': '137b8ecb-402d-41fe-979d-3bb5fd02e7c2',
        '231-326': '73c75851-f1cb-48ce-8c15-af9f4c36f201'
    };
    return groupMap[groupNumber] || 'b8f78604-7d47-4eb0-9389-6b8eaaa1653b';
}
    getGroupNameById(groupId) {
        const groupMap = {
            'b8f78604-7d47-4eb0-9389-6b8eaaa1653b': '231-324',
            '137b8ecb-402d-41fe-979d-3bb5fd02e7c2': '231-325', 
            '73c75851-f1cb-48ce-8c15-af9f4c36f201': '231-326',
            'cd71471f-23e6-44a2-b0bb-a7aa27f8dce8': '231-324',
            'e48a3eb9-b7d3-4d22-948b-d9c4e5147d06': '231-324',
            '5c5f8672-8337-42a4-8a63-a024cbbef6c4': '231-324',
            '83a2659d-a465-4335-873f-df5fecc770e6': '231-324'
        };
        return groupMap[groupId] || 'Неизвестная группа';
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
    async getGroupStudents(groupId) {
        const data = await this.request(`/Groups/${groupId}/students`);
        return {
            group: data.item1,
            students: data.item2 || []
        };
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
    async debugStudents() {
        console.log('=== ДИАГНОСТИКА СТУДЕНТОВ ===');
        
        const testIds = [
            '29883b0c-6b9b-44ab-997e-8113a0a63c21',
            'b6ec0b67-b3ac-4c93-becf-22aaa9546b79'
        ];
        
        for (const id of testIds) {
            try {
                console.log(`Проверяем студента ${id}...`);
                const response = await fetch(`${this.baseUrl}/Students/${id}`);
                console.log(`Статус: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const student = await response.json();
                    console.log('Данные студента:', student);
                } else {
                    console.log('Ошибка HTTP:', response.status);
                }
            } catch (error) {
                console.log('Ошибка запроса:', error.message);
            }
        }
    }
}
const apiClient = new ApiClient();