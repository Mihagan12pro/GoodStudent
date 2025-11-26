class TeacherApp {
    constructor() {
        if(!localStorage.getItem('authToken')){
            window.location.href='/form.html';
            return;
        }
        this.currentUser=JSON.parse(localStorage.getItem('user')||'{}');
        this.students=[];
        this.groups=[];
        this.subjects=[];
        this.currentGroupId='all';
        this.currentSubjectId='all';
        this.currentView='manual';
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
        try{
            console.log('Загружаем данные...');
            await this.loadFromBackend();
        }catch(error){
            console.error('Ошибка загрузки:',error);
            this.useDemoData();
        }
    }
    async loadFromBackend(){
    try{
        console.log('Загружаем студентов и группы...');
        const students=await apiClient.getAllStudents();
        const groups=await apiClient.getAllGroups();
        const subjects=await apiClient.getAllSubjects();        
        console.log('Студенты RAW:',students);
        console.log('Группы RAW:',groups);        
        this.students=this.normalizeStudents(students||[],groups||[]);
        this.groups=groups||[];
        this.subjects=subjects||[];        
        console.log('Нормализованные студенты:',this.students);
        console.log('Нормализованные группы:',this.groups);        
        this.populateSubjectSelector();
        this.populateGroupSelector();
        this.renderStudents();
        this.updateStats();
    }catch(error){
        console.error('Ошибка загрузки из API:',error);
        this.useDemoData();
    }
}
    normalizeStudents(students,groups){
    if(!students||!Array.isArray(students)){
        console.warn('Некорректные данные студентов:',students);
        return[];
    }    
    return students.map(student=>{
        const id=student.id||student.Id||this.generateTempId();
        const name=student.name||student.Name||'';
        const surname=student.surname||student.Surname||'';
        const patronymic=student.patronymic||student.Patronymic||'';
        let groupId=student.groupId||student.group_id||student.group?.id;        
        console.log('Обрабатываем студента:',{name,surname,groupId});
        let groupName='Не указана';
        if(groupId){
            const foundGroup=groups.find(g=>g.id===groupId||g.Id===groupId);
            if(foundGroup){
                groupName=foundGroup.number||foundGroup.name||'Группа найдена';
                console.log('Найдена группа:',foundGroup);
            }else{
                console.log('Группа не найдена для ID:',groupId,'Доступные группы:',groups);
            }
        }        
        return{
            id:id,
            name:name,
            surname:surname,
            patronymic:patronymic,
            fullName:`${surname} ${name} ${patronymic}`.trim(),
            groupId:groupId,
            groupName:groupName,
            present:false
        };
    });
}
    fixGroupIds(groups){
    if(!groups||!Array.isArray(groups)){
        return[];
    }
    return groups.map(group=>({
        id:group.id||group.Id,
        number:group.number||group.name,
        professionId:group.profession_id||group.professionId
    }));
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
        select.innerHTML = '<option value="all">Все группы</option>';
        this.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.number;
            select.appendChild(option);
        });
        console.log(`Загружено групп: ${this.groups.length}`);
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
    renderStudents() {
        const container = document.getElementById('students-list');
        if (!container) return;
        if (this.students.length === 0) {
            container.innerHTML = '<p>Нет студентов для отображения</p>';
            return;
        }
        let filteredStudents = this.students;
        if (this.currentGroupId && this.currentGroupId !== 'all') {
            filteredStudents = this.students.filter(student => 
                student.groupId === this.currentGroupId
            );
        }
        container.innerHTML = filteredStudents.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-name">${student.surname} ${student.name} ${student.patronymic || ''}</div>
                    <div class="student-group">Группа: ${student.groupName || 'Не указана'}</div>
                </div>
                <div class="attendance-toggle">
                    <input type="checkbox" id="student-${student.id}" onchange="teacherApp.toggleStudent('${student.id}', this.checked)">
                    <label for="student-${student.id}">
                        <span class="toggle-slider"></span>
                    </label>
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
        try {
            const result = await apiClient.markAttendance({
                date: new Date().toISOString(),
                subject: this.getCurrentSubject(),
                group: this.getCurrentGroupName(),
                presentStudents: presentStudents,
                presentCount: presentStudents.length,
                totalCount: this.students.length
            });
            alert(`Посещаемость сохранена: ${presentStudents.length} из ${this.students.length} студентов`);
        } catch (error) {
            alert('Ошибка при сохранении посещаемости');
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
        const saveBtn = document.getElementById('save-attendance-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveAttendance());
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
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
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
    useDemoData() {
        console.log('Используем демо-данные');
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