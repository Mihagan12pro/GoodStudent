class CSharpApiClient {
    constructor() {
        this.baseUrl = 'https://localhost:7298/api';
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
            if (['POST', 'PUT', 'PATCH'].includes(options.method) && options.body) {
                config.body = JSON.stringify(options.body);
            }
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`C# API Error [${endpoint}]:`, error);
            throw error;
        }
    }
    async getAllStudents() {
        return await this.request('/Students');
    }
    async getStudentById(id) {
        return await this.request(`/Students/${id}`);
    }
    async createStudent(studentData) {
        return await this.request('/Students', {
            method: 'POST',
            body: {
                name: studentData.name,
                surname: studentData.surname,
                patronymic: studentData.patronymic || '',
                startYear: studentData.startYear || new Date().getFullYear(),
                groupId: studentData.groupId,
                status: studentData.status || 0
            }
        });
    }
    async getAllGroups() {
        return await this.request('/Groups');
    }
    async getGroupById(id) {
        return await this.request(`/Groups/${id}`);
    }
    async getGroupStudents(groupId) {
        return await this.request(`/Groups/students/${groupId}`);
    }
    async createGroup(groupData) {
        return await this.request('/Groups', {
            method: 'POST',
            body: {
                number: groupData.number,
                professionId: groupData.professionId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"
            }
        });
    }
    async getAllInstructors() {
        return await this.request('/Instructors');
    }
    async createInstructor(instructorData) {
        return await this.request('/Instructors', {
            method: 'POST',
            body: {
                name: instructorData.name,
                surname: instructorData.surname,
                patronymic: instructorData.patronymic,
                departmentId: instructorData.departmentId,
                instructorStatus: instructorData.status || 0,
                instructorPosition: instructorData.position || 0
            }
        });
    }
    async getSubjects() {
        try {
            const response = await fetch('http://localhost:5000/api/subjects');
            return await response.json();
        } catch (error) {
            return this.getFallbackSubjects();
        }
    }
    getFallbackSubjects() {
        return [
            { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа' },
            { id: 2, name: 'Нормативное регулирование', type: 'Лекция' },
            { id: 3, name: 'Базы данных', type: 'Практика' }
        ];
    }

    async createStudentsFromExcel(excelStudents) {
        const results = [];
        for (const excelStudent of excelStudents) {
            try {
                const studentData = {
                    name: excelStudent.name,
                    surname: excelStudent.surname,
                    patronymic: excelStudent.patronymic || '',
                    startYear: 2024,
                    groupId: excelStudent.groupId,
                    status: 0
                };
                const result = await this.createStudent(studentData);
                results.push({
                    success: true,
                    student: excelStudent.fullName,
                    id: result
                });
            } catch (error) {
                results.push({
                    success: false,
                    student: excelStudent.fullName,
                    error: error.message
                });
            }
        }
        return results;
    }
}

const csharpApi = new CSharpApiClient();
window.csharpApi = csharpApi;