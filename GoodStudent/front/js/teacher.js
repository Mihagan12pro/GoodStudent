class TeacherApp {
    constructor() {
        if (!localStorage.getItem('authToken')) {
            window.location.href = 'index.html';
            return;
        }
        this.currentView = 'manual';
        this.students = [];
        this.groups = [];
        this.currentGroupId = null;
        this.init();
    }
    async init() {
        console.log('Инициализация приложения...');
        await this.loadGroups();
        await this.loadStudents();
        this.setupNavigation();
        this.setupEventListeners();
        this.displayCurrentDate();
        this.generateCalendar();
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
    async loadGroups() {
        if (!this.currentGroupId) {
            console.log('Группа не выбрана');
            return;
        }
        try {
            console.log('Загрузка групп');
            this.groups = await apiClient.getGroups();
            console.log('Группы загружены:', this.groups);
            this.populateGroupSelector();
        } catch (error) {
            console.error('Ошибка загрузки групп:', error);
            this.groups = this.getMockGroups();
            this.populateGroupSelector();
        }
    }
    populateGroupSelector() {
        const select = document.getElementById('group-select');
        if (!select) {
            console.error('Элемент group-select не найден');
            return;
        }
        select.innerHTML = '';
        this.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id || group.groupId;
            option.textContent = group.name || group.number || `Группа ${group.id}`;
            select.appendChild(option);
        });        
        if (this.groups.length > 0) {
            this.currentGroupId = this.groups[0].id || this.groups[0].groupId;
            select.value = this.currentGroupId;
        }
    }
    async loadStudents() {
        if (!this.currentGroupId) {
            console.log('Группа не выбрана');
            return;
        }      
        try {
            console.log('Загрузка студентов для группы:', this.currentGroupId);
            this.students = await apiClient.getGroupStudents(this.currentGroupId);
            console.log('Студенты загружены:', this.students);
            this.renderStudents();
            this.updateStats();
        } catch (error) {
            console.error('Ошибка загрузки студентов:', error);
            this.students = this.getMockStudents();
            this.renderStudents();
            this.updateStats();
        }
    }
    renderStudents() {
        const container = document.getElementById('students-list');
        if (!container) {
            console.error('Элемент students-list не найден');
            return;
        }        
        if (this.students.length === 0) {
            container.innerHTML = '<p>Нет студентов в выбранной группе</p>';
            return;
        }        
        container.innerHTML = this.students.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-name">${student.name || student.fullName || `Студент ${student.id}`}</div>
                    <div class="student-email">${student.email || 'Email не указан'}</div>
                </div>
                <div class="attendance-toggle">
                    <input type="checkbox" id="student-${student.id}" 
                        ${student.present ? 'checked' : ''}
                        onchange="teacherApp.toggleStudent(${student.id}, this.checked)">
                    <label for="student-${student.id}"></label>
                </div>
            </div>
        `).join('');
    }
    updateStats() {
        const presentCount = this.students.filter(s => s.present).length;
        const totalCount = this.students.length;        
        const presentElement = document.getElementById('present-count');
        const totalElement = document.getElementById('total-count');        
        if (presentElement) presentElement.textContent = presentCount;
        if (totalElement) totalElement.textContent = totalCount;
    }
    async toggleStudent(studentId, isPresent) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            student.present = isPresent;
            this.updateStats();            
            try {
                const attendanceData = {
                    studentId: studentId,
                    present: isPresent,
                    date: new Date().toISOString().split('T')[0],
                    lessonId: this.getCurrentLessonId(),
                    groupId: this.currentGroupId
                };
                
                await apiClient.markAttendance(attendanceData);
                console.log('Посещаемость сохранена:', attendanceData);
            } catch (error) {
                console.error('Ошибка сохранения посещаемости:', error);
                this.saveAttendanceLocally(studentId, isPresent);
            }
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
    switchView(view) {
        this.currentView = view;
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;        
        switch(view) {
            case 'manual':
                contentArea.innerHTML = this.getManualViewHTML();
                this.renderStudents();
                break;
            case 'qr':
                contentArea.innerHTML = this.getQRViewHTML();
                break;
            case 'ai':
                this.openAICamera();
                break;
            case 'history':
                contentArea.innerHTML = this.getHistoryViewHTML();
                break;
        }
    }
    getManualViewHTML() {
        return `
            <div class="manual-attendance-view">
                <div class="students-list-container">
                    <div class="students-header">
                        <h4>Список студентов</h4>
                        <div class="attendance-stats">
                            <span>Присутствуют: <strong id="present-count">0</strong>/<strong id="total-count">0</strong></span>
                        </div>
                    </div>
                    <div class="students-list" id="students-list"></div>
                </div>
                <div class="attendance-calendar">
                    <div class="calendar-header">
                        <h4>Отметка посещаемости</h4>
                        <div class="calendar-nav">
                            <button class="nav-btn">←</button>
                            <span class="current-month">${new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
                            <button class="nav-btn">→</button>
                        </div>
                    </div>
                    <div class="calendar-days"></div>
                    <div class="today-marker">
                        <div class="today-indicator"></div>
                        <span>Сегодня</span>
                    </div>
                </div>
            </div>
        `;
    }
    getQRViewHTML() {
        return `
            <div class="qr-view">
                <h3>QR код для автоматической отметки</h3>
                <p>Студенты могут отсканировать код для отметки присутствия</p>
                <div class="qr-container">
                    <div id="qrcode">QR код появится здесь</div>
                </div>
                <div class="qr-actions">
                    <button class="btn-primary" onclick="teacherApp.generateQRCode()">Сгенерировать QR код</button>
                    <button class="btn-secondary" id="share-qr-btn" disabled>Поделиться QR</button>
                    </div>
            </div>
        `;
    }
    getHistoryViewHTML() {
        return `
            <div class="history-view">
                <h3>История посещаемости</h3>
                <div class="history-stats">
                    <div class="stat-card">
                        <div class="stat-value">24</div>
                        <div class="stat-label">Всего пар</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">87%</div>
                        <div class="stat-label">Средняя посещаемость</div>
                    </div>
                </div>
            </div>
        `;
    }
    setupEventListeners() {
        const groupSelect = document.getElementById('group-select');
        if (groupSelect) {
            groupSelect.addEventListener('change', (e) => {
                this.currentGroupId = e.target.value;
                this.loadStudents();
            });
        }
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                window.location.href = 'form.html';
            });
        }
        const markBtn = document.querySelector('.btn-mark-attendance');
        if (markBtn) {
            markBtn.addEventListener('click', () => {
                this.openAttendanceModal();
            });
        }
        const cameraClose = document.getElementById('camera-close');
        if (cameraClose) {
            cameraClose.addEventListener('click', () => {
                document.getElementById('camera-modal').classList.add('hidden');
            });
        }
    }
    openAttendanceModal() {
        this.switchView('manual');
    }
    openAICamera() {
        const modal = document.getElementById('camera-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    generateQRCode() {
        if (typeof QRCode === 'undefined') {
            console.error('Библиотека QRCode не загружена');
            alert('Библиотека QRCode не загружена');
            return;
        }
        const qrContainer = document.getElementById('qrcode');
        if (!qrContainer) return;
        qrContainer.innerHTML = '';
        const qrData = {
        lessonId: this.getCurrentLessonId(),
        groupId: this.currentGroupId,
        timestamp: new Date().getTime(),
        type: 'attendance'
        };
        const qrString = JSON.stringify(qrData); 
        const qrcode = new QRCode(qrContainer, {
        text: qrString,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
        });
        if (shareBtn) {
        shareBtn.disabled = false;
        shareBtn.onclick = () => this.shareQRCode();
    }
        console.log('QR код сгенерирован:', qrData);
    }
    async shareQRCode() {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer || qrContainer.innerHTML.includes('QR код появится здесь')) {
        alert('Сначала сгенерируйте QR код');
        return;
    }
    try {
        if (navigator.share) {
            const qrData = {
                lessonId: this.getCurrentLessonId(),
                groupId: this.currentGroupId,
                timestamp: new Date().getTime(),
                type: 'attendance'
            };
            
            await navigator.share({
                title: 'QR код для отметки посещаемости',
                text: `Отсканируйте QR код для отметки на паре. Группа: ${this.currentGroupId}`,
                url: window.location.href
            });
        } else {
            const qrText = `QR код для группы ${this.currentGroupId}. Откройте приложение для сканирования.`;
            await navigator.clipboard.writeText(qrText);
            alert('Информация о QR коде скопирована в буфер обмена!');
        }
    } catch (error) {
        console.error('Ошибка при попытке поделиться:', error);
        alert('Не удалось поделиться QR кодом');
    }
}
    getCurrentLessonId() {
        return 1; 
    }
    getMockGroups() {
        return [
            { id: 1, name: "231-324" },
            { id: 2, name: "231-325" },
            { id: 3, name: "231-326" }
        ];
    }
    getMockStudents() {
        return [
            { id: 1, name: "Иванов Алексей", email: "ivanov@edu.ru", present: false },
            { id: 2, name: "Петрова Мария", email: "petrova@edu.ru", present: true },
            { id: 3, name: "Сидоров Дмитрий", email: "sidorov@edu.ru", present: false }
        ];
    }
    
}
const teacherApp = new TeacherApp();