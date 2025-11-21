class ManualAttendance {
    constructor() {
        this.subjectId = new URLSearchParams(window.location.search).get('subject');
        this.students = [];
        this.init();
    }
    async init() {
        await this.loadSubjectInfo();
        await this.loadStudents();
        this.setupEventListeners();
    }
    async loadSubjectInfo() {
        document.getElementById('current-subject').textContent = 'Информатика - Группа П-401';
    }
    async loadStudents() {
        try {
            const response = await fetch(`/api/groups/students?subject=${this.subjectId}`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            if (response.ok) {
                this.students = await response.json();
            } else {
                this.students = this.getMockStudents();
            }
            
            this.renderStudents();
        } catch (error) {
            console.error('Ошибка загрузки студентов:', error);
            this.students = this.getMockStudents();
            this.renderStudents();
        }
    }
    renderStudents() {
        const container = document.getElementById('students-list');
        
        container.innerHTML = this.students.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-email">${student.email}</div>
                </div>
                <div class="attendance-toggle">
                    <input type="checkbox" id="student-${student.id}" 
                        ${student.present ? 'checked' : ''}
                        onchange="manualAttendance.toggleStudent(${student.id}, this.checked)">
                    <label for="student-${student.id}">Присутствует</label>
                </div>
            </div>
        `).join('');
    }
    toggleStudent(studentId, isPresent) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            student.present = isPresent;
        }
    }
    setupEventListeners() {
        document.getElementById('save-attendance').addEventListener('click', () => {
            this.saveAttendance();
        });
        document.getElementById('add-student').addEventListener('click', () => {
            document.getElementById('add-student-modal').classList.remove('hidden');
        });
        document.getElementById('add-student-close').addEventListener('click', () => {
            document.getElementById('add-student-modal').classList.add('hidden');
        });
        document.getElementById('add-student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewStudent();
        });
    }
    async saveAttendance() {
        const attendanceData = {
            subjectId: this.subjectId,
            students: this.students.map(student => ({
                studentId: student.id,
                present: student.present
            }))
        };
        try {
            const response = await fetch('/api/attendance/manual', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(attendanceData)
            });
            if (response.ok) {
                alert('Посещаемость сохранена!');
                window.history.back();
            } else {
                alert('Ошибка при сохранении посещаемости');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при сохранении посещаемости');
        }
    }
    addNewStudent() {
        const name = document.getElementById('student-name').value;
        const email = document.getElementById('student-email').value;
        const studentId = document.getElementById('student-id').value;
        const newStudent = {
            id: Date.now(), 
            name: name,
            email: email,
            studentId: studentId,
            present: true
        };
        this.students.push(newStudent);
        this.renderStudents();
        document.getElementById('add-student-form').reset();
        document.getElementById('add-student-modal').classList.add('hidden');
    }
    getMockStudents() {
        return [
            { id: 1, name: "Иванов Алексей", email: "ivanov@edu.ru", present: false },
            { id: 2, name: "Петрова Мария", email: "petrova@edu.ru", present: true },
            { id: 3, name: "Сидоров Дмитрий", email: "sidorov@edu.ru", present: false }
        ];
    }
    getToken() {
        return localStorage.getItem('teacherToken');
    }
}
function goBack() {
    window.history.back();
}
const manualAttendance = new ManualAttendance();