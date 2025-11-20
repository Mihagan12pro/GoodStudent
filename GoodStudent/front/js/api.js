class ApiClient {
    constructor() {
        this.baseUrl = 'https://localhost:5000/api'; 
        this.token = localStorage.getItem('authToken');
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }
        try {
            console.log(`API Request: ${url}`, config);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }            
        } catch (error) {
            console.error('API Error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            throw new Error('CORS ошибка: запрос с этого домена не разрешён');
        }
            throw new Error(`Ошибка соединения: ${error.message}`);
        }
    }
    async getGroups() {
        return await this.request('/groups');
    }
    async getGroup(id) {
        return await this.request(`/groups/${id}`);
    }
    async getStudents() {
        return await this.request('/students');
    }
    async getGroupStudents(groupId) {
        try {
            return await this.request(`/groups/${groupId}/students`);
        }
        catch (error) {
            const allStudents = await this.getStudents();
            return allStudents.filter(student => student.groupId === groupId);
        }
    }
    async getLessonAttendance(lessonId) {
        return await this.request(`/attendance/lesson/${lessonId}`);
    }
    async getQRAttendance(lessonId) {
        return await this.request(`/attendance/qr-status/${lessonId}`);
    }
    async generateQRCode(lessonId, duration = 600000) {
        return await this.request('/qr/generate', {
            method: 'POST',
            body: { lessonId, duration }
        });
    }
    async getSchedule(date = null) {
        const query = date ? `?date=${date}` : '';
        return await this.request(`/schedule${query}`);
    }
    async markManualAttendance(attendanceData) {
        return await this.request('/attendance/manual', {
            method: 'POST',
            body: attendanceData
        });
    }
    async markAttendance(attendanceData) {
        return await this.request('/attendance', {
            method: 'POST',
            body: attendanceData
        });
    }
    async getAttendance() {
        return await this.request('/attendance');
    }
    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });       
        if (data.token) {
            this.token = data.token;
            localStorage.setItem('authToken', data.token);
        }        
        return data;
    }
    logout() {
        this.token = null;
        localStorage.removeItem('authToken');
    }
}
const apiClient = new ApiClient();