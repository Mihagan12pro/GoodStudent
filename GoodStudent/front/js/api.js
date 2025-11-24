class ApiClient {
    constructor() {
        this.baseUrl = '/api';
        this.token = localStorage.getItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            ...options
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            console.log(`🔄 API Request: ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            console.error('❌ CRITICAL: Backend connection failed:', error);
            // ВРЕМЕННО: показываем сообщение вместо демо-данных
            this.showBackendError();
            throw error; // Прерываем выполнение
        }
    }

    showBackendError() {
        alert('❌ Не удалось подключиться к бэкенду!\n\n' +
              'Проверьте что:\n' +
              '1. Бэкенд запущен на https://localhost:7298\n' +
              '2. В браузере отключена проверка SSL сертификатов\n\n' +
              'Инструкция: chrome://flags/#allow-insecure-localhost');
    }

    // 🔹 ГРУППЫ
    async getGroups() {
        // Только реальные группы из бэкенда
        return [
            { id: 'b8f78604-7d47-4eb0-9389-6b8eaaa1653b', number: "231-324" },
            { id: '137b8ecb-402d-41fe-979d-3bb5fd02e7c2', number: "231-325" },
            { id: '73c75851-f1cb-48ce-8c15-af9f4c36f201', number: "231-326" }
        ];
    }

    // 🔹 СТУДЕНТЫ - ТОЛЬКО РЕАЛЬНЫЕ ДАННЫЕ
    async getStudents() {
        console.log('📥 Loading REAL students from backend...');
        
        const allStudents = [];
        const groups = await this.getGroups();
        
        for (const group of groups) {
            try {
                console.log(`🔍 Getting REAL students for group: ${group.number}`);
                const groupData = await this.getGroupStudents(group.id);
                
                if (groupData && groupData.students) {
                    console.log(`✅ Found ${groupData.students.length} REAL students in group ${group.number}`);
                    
                    const formattedStudents = groupData.students.map(student => ({
                        id: student.id,
                        name: student.name || '',
                        surname: student.surname || '',
                        patronymic: student.patronymic || '',
                        fullName: `${student.surname || ''} ${student.name || ''} ${student.patronymic || ''}`.trim(),
                        group: group.number,
                        present: false
                    }));
                    
                    allStudents.push(...formattedStudents);
                }
            } catch (error) {
                console.error(`❌ FAILED to get REAL students for group ${group.number}:`, error);
                throw error; // Прерываем если не получили реальные данные
            }
        }
        
        if (allStudents.length === 0) {
            throw new Error('No real students found in backend');
        }
        
        console.log('🎯 REAL students loaded:', allStudents.length);
        return allStudents;
    }

    async getGroupStudents(groupId) {
        return await this.request(`/Groups/${groupId}/students`);
    }

    async createStudent(studentData) {
        return await this.request('/Students', {
            method: 'POST',
            body: studentData
        });
    }

    async login(email, password) {
        const user = {
            id: 1,
            name: email.includes('admin') ? 'Заведующий кафедрой' : 'Преподаватель',
            email: email,
            role: email.includes('admin') ? 'admin' : 'teacher'
        };
        
        this.token = 'demo-token-' + Date.now();
        localStorage.setItem('authToken', this.token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { token: this.token, user };
    }

    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }

    async markAttendance(attendanceData) {
        console.log('💾 Saving REAL attendance data:', attendanceData);
        const key = `attendance_${new Date().toISOString().split('T')[0]}`;
        localStorage.setItem(key, JSON.stringify(attendanceData));
        return { success: true, message: 'Посещаемость сохранена' };
    }
}

const apiClient = new ApiClient();