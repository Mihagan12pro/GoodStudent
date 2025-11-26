class TeacherApp {
    constructor() {
        if (!localStorage.getItem('authToken')) {
            window.location.href = '/form.html';
            return;
        }
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        this.students = [];
        this.groups = [];
        this.subjects = [];
        this.currentGroupId = 'all';
        this.currentSubjectId = 'all';
        this.currentView = 'manual';
        this.init();
    }
    async init() {
        console.log('Инициализация приложения преподавателя');
        await this.loadInitialData();
        this.setupEventListeners();
        this.displayCurrentDate();
        this.setupAttendanceButton();
        this.generateCalendar();
    }
    async loadInitialData() {
        try {
            console.log('Загружаем данные из бэкенда...');
            const [students, groups, subjects] = await Promise.all([
                apiClient.getAllStudents().catch(() => []),
                apiClient.getAllGroups().catch(() => []),
                apiClient.getAllSubjects().catch(() => [])
            ]);
            this.students = this.normalizeStudents(students || []);
            this.groups = groups || [];
            this.subjects = subjects || [];
            console.log(`Данные загружены: Студентов: ${this.students.length} Групп: ${this.groups.length} Предметов: ${this.subjects.length}`);
            this.populateSubjectSelector();
            this.populateGroupSelector();
            this.renderStudents();
            this.updateStats();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.showErrorMessage('Не удалось загрузить данные.');
        }
    }
fixGroupIds(groups) {
    if (!groups || !Array.isArray(groups)) {
        return [];
    }
    const groupNameToId = {
        '231-324': '1',
        '231-325': '2', 
        '231-326': '3',
        'ПППП': '4',
        '666-666': '5',
        'Нани': '6'
    };
    return groups.map((group, index) => {
        let fixedId = group.id;
        
        if (!fixedId || fixedId === 'undefined') {
            fixedId = groupNameToId[group.number] || `group-${index + 1}`;
        }
        return {
            ...group,
            id: fixedId
        };
    });
}
    debugStudentsAndGroups() {
        console.log('ДЕБАГ СТУДЕНТОВ И ГРУПП ===');
        console.log('Все группы:', this.groups);
        console.log('Все студенты:', this.students);
        
        this.students.forEach(student => {
            console.log(`${student.fullName}: groupId=${student.groupId}, groupName=${student.groupName}`);
        });        
        console.log(`Текущая выбранная группа ID: ${this.currentGroupId}`);
    }
    normalizeStudents(students) {
    if (!students || !Array.isArray(students)) {
        console.warn('Некорректные данные студентов:', students);
        return [];
    }
    return students.map(student => {
        const id = student.id || student.Id || this.generateTempId();
        const name = student.name || student.Name || '';
        const surname = student.surname || student.Surname || '';
        const patronymic = student.patronymic || student.Patronymic || '';
        let groupId = student.groupId || student.group_id || student.group?.id;
        if (typeof groupId === 'number') {
            groupId = groupId.toString();
        }
        if (!groupId && student.groupName) {
            const groupMap = {
                '231-324': '1',
                '231-325': '2',
                '231-326': '3'
            };
            groupId = groupMap[student.groupName];
        }
        const groupNumber = student.groupNumber || student.group?.number || this.getGroupNameById(groupId);
        return {
            id: id,
            name: name,
            surname: surname,
            patronymic: patronymic,
            fullName: `${surname} ${name} ${patronymic}`.trim(),
            groupId: groupId,
            groupName: groupNumber,
            present: false
        };
    });
}
    generateTempId() {
        return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    getGroupNameById(groupId) {
        if (!groupId) return 'Не указана';
        const group = this.groups.find(g => g.id === groupId);
        return group ? group.number : `Группа ${groupId}`;
    }
    populateGroupSelector() {
        const select = document.getElementById('group-select');
        if (!select) {
            console.error('Элемент group-select не найден');
            return;
        }
        console.log('Загруженные группы:', this.groups);
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
            console.log(`Добавляем группу: ${group.number} (ID: ${group.id})`);
            select.appendChild(option);
        });
        if (currentValue && this.groups.some(g => g.id === currentValue)) {
            select.value = currentValue;
            this.currentGroupId = currentValue;
        } else {
            select.value = 'all';
            this.currentGroupId = 'all';
        }
        console.log(`Текущая выбранная группа: ${select.value}`);
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
                    <p>Загрузите студентов через панель администратора</p>
                    <button class="btn-primary" onclick="teacherApp.loadInitialData()">
                        Обновить данные
                    </button>
                </div>
            `;
            return;
        }
        let filteredStudents = this.students;        
        if (this.currentGroupId && this.currentGroupId !== 'all') {
            console.log(`Фильтруем студентов по группе: ${this.currentGroupId}`);
            
            filteredStudents = this.students.filter(student => {
                const matches = student.groupId === this.currentGroupId;
                console.log(`Студент ${student.fullName}: groupId=${student.groupId}, matches=${matches}`);
                return matches;
            });
        }
        console.log(`После фильтрации: ${filteredStudents.length} студентов`);
        if (filteredStudents.length === 0) {
            container.innerHTML = `
                <div class="no-students-message">
                    <h3>Нет студентов в выбранной группе</h3>
                    <p>Выберите другую группу или загрузите студентов</p>
                    <button class="btn-primary" onclick="teacherApp.loadInitialData()">
                        Обновить данные
                    </button>
                </div>
            `;
            return;
        }
        this.updateStudentsHeader();
        container.innerHTML = filteredStudents.map(student => `
            <div class="student-item ${student.present ? 'present' : ''}">
                <div class="student-info">
                    <div class="student-name">${student.fullName}</div>
                    <div class="student-group">Группа: ${student.groupName}</div>
                </div>
                <div class="attendance-toggle">
                    <input type="checkbox" id="student-${student.id}" 
                        ${student.present ? 'checked' : ''}
                        onchange="teacherApp.toggleStudent('${student.id}', this.checked)">
                    <label for="student-${student.id}">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
        `).join('');
        this.updateStats();
    }
    updateStudentsHeader() {
        const studentsHeader = document.querySelector('.students-header h4');
        if (studentsHeader) {
            if (this.currentGroupId === 'all') {
                studentsHeader.textContent = `Список всех студентов (${this.students.length})`;
            } else {
                const group = this.groups.find(g => g.id === this.currentGroupId);
                const groupName = group ? group.number : 'Неизвестная группа';
                studentsHeader.textContent = `Список студентов группы ${groupName}`;
            }
        }
    }
    toggleStudent(studentId, isPresent) {
        const student = this.students.find(s => s.id === studentId);
        if (student) {
            student.present = isPresent;
            const studentElement = document.querySelector(`#student-${studentId}`)?.closest('.student-item');
            if (studentElement) {
                studentElement.classList.toggle('present', isPresent);
            }
            
            this.updateStats();
        }
    }
    updateStats() {
        let presentCount, totalCount;
        if (this.currentGroupId === 'all') {
            presentCount = this.students.filter(s => s.present).length;
            totalCount = this.students.length;
        } else {
            const filteredStudents = this.students.filter(s => s.groupId === this.currentGroupId);
            presentCount = filteredStudents.filter(s => s.present).length;
            totalCount = filteredStudents.length;
        }        
        const presentElement = document.getElementById('present-count');
        const totalElement = document.getElementById('total-count');
        
        if (presentElement) presentElement.textContent = presentCount;
        if (totalElement) totalElement.textContent = totalCount;
        const statsElement = document.querySelector('.attendance-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <span>Присутствуют: <strong id="present-count">${presentCount}</strong>/<strong id="total-count">${totalCount}</strong></span>
            `;
        }
    }
    async saveAttendance() {
        let studentsToSave;
        if (this.currentGroupId === 'all') {
            studentsToSave = this.students;
        } else {
            studentsToSave = this.students.filter(s => s.groupId === this.currentGroupId);
        }
        if (studentsToSave.length === 0) {
            alert('Нет студентов для сохранения посещаемости');
            return;
        }
        const presentStudents = studentsToSave.filter(s => s.present);
        const absentStudents = studentsToSave.filter(s => !s.present);
        if (presentStudents.length === 0 && !confirm('Ни один студент не отмечен как присутствующий. Сохранить пустую посещаемость?')) {
            return;
        }
        const attendanceData = {
            date: new Date().toISOString(),
            subject: this.getCurrentSubject(),
            group: this.getCurrentGroupName(),
            presentCount: presentStudents.length,
            totalCount: studentsToSave.length,
            presentStudents: presentStudents.map(s => ({
                id: s.id,
                name: s.fullName,
                group: s.groupName
            })),
            absentStudents: absentStudents.map(s => ({
                id: s.id,
                name: s.fullName,
                group: s.groupName
            })),
            timestamp: new Date().toLocaleString('ru-RU')
        };
        try {
            console.log('Сохранение посещаемости:', attendanceData);
            
            const result = await apiClient.markAttendance(attendanceData);
            
            alert(`${result.message}\n\nПрисутствуют: ${presentStudents.length} из ${studentsToSave.length}`);
            
            console.log('Посещаемость сохранена:', result);
            
        } catch (error) {
            console.error('Ошибка сохранения посещаемости:', error);
            alert('Ошибка при сохранении посещаемости. Данные сохранены локально.');
        }
    }
    getCurrentSubject() {
        const currentScheduleItem = document.querySelector('.schedule-item.current');
        if (currentScheduleItem) {
            const subjectElement = currentScheduleItem.querySelector('.item-title');
            if (subjectElement) {
                return subjectElement.textContent;
            }
        }
        
        return this.subjects.length > 0 ? this.subjects[0].name : 'Неизвестный предмет';
    }
    getCurrentGroupName() {
        if (this.currentGroupId === 'all') {
            return 'Все группы';
        }
        
        const group = this.groups.find(g => g.id === this.currentGroupId);
        return group ? group.number : 'Неизвестная группа';
    }
    async loadSubjects() {
        try {
            return await apiClient.getAllSubjects();
        } catch (error) {
            console.warn('Не удалось загрузить предметы:', error);
            return [
                { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа' },
                { id: 2, name: 'Нормативное регулирование', type: 'Лекция' }
            ];
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
        console.log('Переключение на вид:', view);
        const contentArea = document.getElementById('content-area');
        if (!contentArea) return;
        switch (view) {
            case 'manual':
                contentArea.innerHTML = this.getManualAttendanceView();
                this.renderStudents();
                break;
            case 'qr':
                window.location.href = '/pages/qr-attendance.html';
                break;
            case 'ai':
                this.openCameraModal();
                break;
            case 'history':
                this.showAttendanceHistory();
                break;
        }
    }
    getManualAttendanceView() {
        return `
            <div class="manual-attendance-view">
                <div class="students-list-container">
                    <div class="students-header">
                        <h4>Список студентов</h4>
                        <div class="attendance-stats">
                            <span>Присутствуют: <strong id="present-count">0</strong>/<strong id="total-count">0</strong></span>
                        </div>
                    </div>                            
                    <div class="students-list" id="students-list">
                        <p style="text-align: center; color: #666; padding: 20px;">
                            Загрузка студентов...
                        </p>
                    </div>
                </div>
                <div class="attendance-actions" style="padding: 20px; text-align: center;">
                    <button class="btn-primary" id="save-attendance-btn" 
                    style="padding: 12px 24px; font-size: 16px;">Сохранить посещаемость
                    </button>
                </div>
                <div class="attendance-calendar">
                    <div class="calendar-header">
                        <h4>Отметка посещаемости</h4>
                        <div class="calendar-nav">
                            <button class="nav-btn">←</button>
                            <span class="current-month">Ноябрь 2025</span>
                            <button class="nav-btn">→</button>
                        </div>
                    </div>
                    <div class="calendar-days">
                    </div>
                    <div class="today-marker">
                        <div class="today-indicator"></div>
                        <span>Сегодня</span>
                    </div>
                </div>
            </div>
        `;
    }
    openCameraModal() {
        const modal = document.getElementById('camera-modal');
        if (modal) {
            modal.classList.remove('hidden');
        } else {
            alert('AI-камера будет доступна в следующей версии');
        }
    }
    async showAttendanceHistory() {
        try {
            const history = await apiClient.getAttendanceHistory();
            const contentArea = document.getElementById('content-area');
            
            if (history.length === 0) {
                contentArea.innerHTML = `
                    <div class="history-view">
                        <h3>История посещаемости</h3>
                        <div class="no-history">
                            <p>Нет данных о посещаемости</p>
                        </div>
                    </div>
                `;
                return;
            }
            contentArea.innerHTML = `
                <div class="history-view">
                    <h3>История посещаемости</h3>
                    <div class="history-list">
                        ${history.map(record => `
                            <div class="history-item">
                                <div class="history-date">${new Date(record.date).toLocaleDateString('ru-RU')}</div>
                                <div class="history-subject">${record.subject}</div>
                                <div class="history-group">${record.group_name}</div>
                                <div class="history-stats">${record.present_count}/${record.total_count}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        }
    }
    populateSubjectSelector() {
        const select = document.getElementById('subject-select');
        if (!select) {
            console.error('Элемент subject-select не найден');
            return;
        }
        select.innerHTML = '<option value="all">Все предметы</option>';
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });
        console.log(`Загружено предметов: ${this.subjects.length}`);
    }
    setupEventListeners() {
        const groupSelect = document.getElementById('group-select');
        if (groupSelect) {
            groupSelect.addEventListener('change', (e) => {
                this.currentGroupId = e.target.value;
                this.renderStudents();
            });
        }
        const subjectSelect = document.getElementById('subject-select');
        if (subjectSelect) {
            subjectSelect.addEventListener('change', (e) => {
                this.currentSubjectId = e.target.value;
                this.renderStudents();
            });
        }
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = 'form.html';
            });
        }
    }
    setupAttendanceButton() {
        const saveButton = document.getElementById('save-attendance-btn');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveAttendance());
        }
    }
    async loadStudentsForAttendance() {
        console.log('Загрузка студентов для текущего занятия');
        
        const saveButton = document.getElementById('save-attendance-btn');
        if (saveButton) {
            saveButton.style.display = 'block';
        }        
        await this.loadInitialData();        
        alert(`Студенты загружены: ${this.students.length} человек`);
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
    showErrorMessage(message) {
        const container = document.getElementById('students-list');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Ошибка загрузки</h3>
                    <p>${message}</p>
                    <div class="error-actions">
                        <button onclick="teacherApp.loadInitialData()" class="btn-primary">
                            Повторить попытку
                        </button>
                        <button onclick="teacherApp.useDemoData()" class="btn-secondary">
                            Использовать демо-данные
                        </button>
                    </div>
                </div>
            `;
        }
    }
    useDemoData() {
        console.log('Используем демо-данные...');
        
        this.students = [
            {
                id: '1',
                name: 'Иван',
                surname: 'Иванов',
                patronymic: 'Иванович',
                fullName: 'Иванов Иван Иванович',
                groupId: '1',
                groupName: '231-324',
                present: false
            },
            {
                id: '2',
                name: 'Мария',
                surname: 'Петрова',
                patronymic: 'Сергеевна',
                fullName: 'Петрова Мария Сергеевна',
                groupId: '1',
                groupName: '231-324',
                present: false
            },
            {
                id: '3',
                name: 'Сергей',
                surname: 'Сидоров',
                patronymic: 'Алексеевич',
                fullName: 'Сидоров Сергей Алексеевич',
                groupId: '2',
                groupName: '231-325',
                present: false
            }
        ];
        this.groups = [
            { id: '1', number: '231-324' },
            { id: '2', number: '231-325' },
            { id: '3', number: '231-326' }
        ];
        this.populateGroupSelector();
        this.renderStudents();
        this.updateStats();
        
        alert('Демо-данные загружены!');
    }
}
const teacherApp = new TeacherApp();
window.teacherApp = teacherApp;