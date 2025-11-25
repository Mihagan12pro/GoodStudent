class TeacherApp {
    constructor() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = '/form.html'; 
            return;
        }      
        this.currentView = 'manual';
        this.students = [];
        this.groups = [];
        this.currentGroupId = 'all';
        this.init();
    }
    async init() {
        console.log('Инициализация приложения преподавателя');     
        await this.loadGroups();
        await this.loadStudents();
        this.setupNavigation();
        this.setupEventListeners();
        this.displayCurrentDate();
        this.generateCalendar();
        this.setupAttendanceButton();
    }
    async loadStudents() {
        try {
            console.log('Загрузка студентов из C# бэкенда...');
            this.students = await apiClient.getAllStudents();
            console.log(`Загружено студентов: ${this.students.length}`);
            
            this.renderStudents();
            this.updateStats();
            
        } catch (error) {
            console.error('Ошибка загрузки студентов:', error);
            this.showErrorMessage();
        }
    }
    async loadGroups() {
        try {
            console.log('Загрузка групп...');
            this.groups = await apiClient.getGroups();
            console.log('Группы загружены:', this.groups);
            this.populateGroupSelector();
        } catch (error) {
            console.warn('Ошибка загрузки групп:', error);
            this.groups = [
                {id:'b8f78604-7d47-4eb0-9389-6b8eaaa1653b', number: '231-324' },
                {id:'137b8ecb-402d-41fe-979d-3bb5fd02e7c2', number: '231-325' },
                {id:'73c75851-f1cb-48ce-8c15-af9f4c36f201', number: '231-326' }
            ];
            this.populateGroupSelector();
        }
    }
    populateGroupSelector() {
        const select = document.getElementById('group-select');
        if (!select) {
            console.error('Элемент group-select не найден');
            return;
        }
        const currentValue = select.value;
        select.innerHTML = '';
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Все группы';
        select.appendChild(allOption);
        this.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.number || `Группа ${group.id}`;
            select.appendChild(option);
        });
        if (currentValue) {
            select.value = currentValue;
        }
    }
    renderStudents() {
        const container = document.getElementById('students-list');
        if (!container) {
            console.error('Элемент students-list не найден');
            return;
        }                  
        if (this.students.length === 0) {
            container.innerHTML = `
                <div class="no-students-message">
                    <h3>Нет студентов для отображения</h3>
                    <p>Создаем тестовых студентов...</p>
                </div>
            `;
            return;
        }              
        let filteredStudents = this.students;
        if (this.currentGroupId && this.currentGroupId !== 'all') {
            const selectedGroup = this.groups.find(g => g.id === this.currentGroupId);
            if (selectedGroup) {
                filteredStudents = this.students.filter(student => 
                    student.groupId === this.currentGroupId || 
                    student.groupName === selectedGroup.number
                );
            }
        }
        container.innerHTML = filteredStudents.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-name">${student.fullName}</div>
                    <div class="student-group">Группа: ${student.groupName}</div>
                </div>
                <div class="attendance-toggle">
                    <input type="checkbox" id="student-${student.id}" 
                        ${student.present ? 'checked' : ''}
                        onchange="teacherApp.toggleStudent('${student.id}', this.checked)">
                    <label for="student-${student.id}"></label>
                </div>
            </div>
        `).join('');
        this.updateStats();
    }
    toggleStudent(studentId, isPresent) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            student.present = isPresent;
            this.updateStats();
        }
    }
    updateStats() {
        const presentCount = this.students.filter(s => s.present).length;
        const totalCount = this.students.length;
        
        const presentElement = document.getElementById('present-count');
        const totalElement = document.getElementById('total-count');
        
        if (presentElement) presentElement.textContent = presentCount;
        if (totalElement) totalElement.textContent = totalCount;
    }
    async saveAttendance() {
        const presentStudents = this.students.filter(s => s.present);
        const totalCount = this.students.length;
        if (presentStudents.length === 0) {
            if (!confirm('Ни один студент не отмечен как присутствующий. Сохранить пустую посещаемость?')) {
                return;
            }
        }
        const attendanceData = {
            date: new Date().toISOString(),
            presentCount: presentStudents.length,
            totalCount: totalCount,
            students: this.students.map(student => ({
                studentId: student.id,
                studentName: student.fullName,
                present: student.present,
                group: student.groupName
            }))
        };
        try {
            console.log('Сохранение посещаемости:', attendanceData);
            const result = await apiClient.markAttendance(attendanceData);
            
            alert(result.message);
            console.log(`Посещаемость сохранена: ${presentStudents.length} из ${totalCount}`);
            
        } catch (error) {
            console.error('Ошибка сохранения посещаемости:', error);
            alert('Ошибка при сохранении посещаемости.');
        }
    }
    showErrorMessage() {
        const container = document.getElementById('students-list');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось подключиться к серверу</p>
                    <button onclick="teacherApp.loadStudents()" class="btn-primary">
                        Повторить попытку
                    </button>
                </div>
            `;
        }
    }
    async loadStudentsForAttendance() {
        const saveButton = document.getElementById('save-attendance-btn');
        if (saveButton) {
            saveButton.style.display = 'block';
        }
        await this.loadStudents();
    }
    setupAttendanceButton() {
        const saveButton = document.getElementById('save-attendance-btn');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveAttendance());
        }
    }
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.switchView(view);
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    setupEventListeners() {
        const groupSelect = document.getElementById('group-select');
        if (groupSelect) {
            groupSelect.addEventListener('change', (e) => {
                this.currentGroupId = e.target.value;
                this.renderStudents();
            });
        }
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                window.location.href = 'form.html';
            });
        }
    }
    displayCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('ru-RU', options);
        }
    }
    generateCalendar() {
        const container = document.querySelector('.calendar-days');
        if (!container) return;
        
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        
        let calendarHTML = '';
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = i === today.getDate();
            const dayClass = isToday ? 'calendar-day today' : 'calendar-day';
            calendarHTML += `<div class="${dayClass}">${i}</div>`;
        }        
        container.innerHTML = calendarHTML;
    }
    switchView(view) {
        this.currentView = view;
        console.log('Переключение на вид:', view);
    }
}
const teacherApp = new TeacherApp();