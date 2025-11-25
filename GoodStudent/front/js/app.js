class AttendanceApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentGroup = null;
        this.currentUser = null;
        this.scheduleData = [];
        this.students = [];
        this.groups = [];
        this.subjects = [];
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.loadUserData();
        this.setupEventListeners();
        await this.loadInitialData();
        this.showPage('dashboard');
    }

    async checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'form.html';
            return;
        }
    }

    loadUserData() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUserInterface();
        }
    }

    updateUserInterface() {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement && this.currentUser) {
            userNameElement.textContent = this.currentUser.name || 'Преподаватель';
        }

        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        const groupSelector = document.getElementById('group-selector');
        if (groupSelector) {
            groupSelector.addEventListener('change', (e) => this.onGroupChange(e.target.value));
        }
    }

    async loadInitialData() {
        try {
            console.log('🔄 Загрузка начальных данных...');
            
            // Параллельная загрузка всех данных
            const [students, groups, subjects, schedule] = await Promise.all([
                apiClient.getAllStudents(),
                apiClient.getAllGroups(),
                this.loadSubjects(),
                this.loadSchedule()
            ]);

            this.students = students || [];
            this.groups = groups || [];
            this.subjects = subjects || [];
            this.scheduleData = schedule || [];

            console.log(`✅ Данные загружены: ${this.students.length} студентов, ${this.groups.length} групп, ${this.subjects.length} предметов`);

            this.populateGroupSelector();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
            this.showError('Ошибка загрузки данных. Проверьте подключение к серверу.');
        }
    }

    async loadSubjects() {
        try {
            // Пробуем получить предметы кафедры
            const departmentId = this.getUserDepartmentId();
            if (departmentId) {
                return await apiClient.getDepartmentSubjects(departmentId);
            } else {
                // Если нет кафедры, получаем все предметы или тестовые
                return await this.getFallbackSubjects();
            }
        } catch (error) {
            console.warn('Не удалось загрузить предметы:', error);
            return this.getFallbackSubjects();
        }
    }

    getUserDepartmentId() {
        // TODO: Получить ID кафедры из данных пользователя
        // Пока возвращаем null для тестирования
        return null;
    }

    getFallbackSubjects() {
        return [
            { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа', room: 'Пр/06' },
            { id: 2, name: 'Нормативное регулирование', type: 'Лекция', room: 'Пр/01' },
            { id: 3, name: 'Базы данных', type: 'Практика', room: 'Ак/201' },
            { id: 4, name: 'Веб-программирование', type: 'Лаб. работа', room: 'Пр/04' }
        ];
    }

    async loadSchedule(date = null) {
        try {
            // TODO: Реализовать загрузку реального расписания
            // Пока используем тестовые данные
            return this.getMockSchedule();
        } catch (error) {
            console.error('Ошибка загрузки расписания:', error);
            return this.getMockSchedule();
        }
    }

    getMockSchedule() {
        const now = new Date();
        return [
            {
                id: '1',
                subject: 'Системы инженерного анализа',
                time: '12:20 - 13:50',
                group: '231-324',
                room: 'Пр/06',
                type: 'Лаб. работа',
                teachers: 'Зубарев А.В. - Ковалева А.В.',
                dates: '01 Сен - 31 Дек',
                isCurrent: true
            },
            {
                id: '2',
                subject: 'Нормативное регулирование',
                time: '14:00 - 15:30',
                group: '231-324',
                room: 'Пр/01',
                type: 'Лаб. работа',
                teachers: 'Филатова И.В. - Смирнова Ю.В.',
                dates: '22 Окт - 31 Дек',
                isCurrent: false
            }
        ];
    }

    populateGroupSelector(groups = null) {
        const selector = document.getElementById('group-selector');
        if (!selector) return;

        const groupsToUse = groups || this.groups;
        
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }

        groupsToUse.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.number || group.name;
            selector.appendChild(option);
        });
    }

    renderSchedule() {
        const container = document.getElementById('schedule-container');
        if (!container) return;

        if (!this.scheduleData || this.scheduleData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <h3>Нет пар на сегодня</h3>
                    <p>Расписание пусто или не загружено</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.scheduleData.map(classItem => `
            <div class="schedule-card ${classItem.isCurrent ? 'current' : ''}" data-class-id="${classItem.id}">
                <div class="class-header">
                    <h3 class="class-title">${classItem.subject}</h3>
                    <span class="class-time">${classItem.time}</span>
                </div>
                
                <div class="class-details">
                    <div class="class-group">Группа: ${classItem.group}</div>
                    <div class="class-location">Аудитория: ${classItem.room}</div>
                    <div class="class-type">Тип: ${classItem.type}</div>
                    <div class="class-teachers">${classItem.teachers}</div>
                    <div class="class-dates">${classItem.dates}</div>
                </div>

                <div class="attendance-actions">
                    <button class="action-btn manual-btn" onclick="app.openManualAttendance('${classItem.id}')">
                        <span class="action-icon">✏️</span>
                        Ручной ввод
                    </button>
                    
                    <button class="action-btn qr-btn" onclick="app.openQRAttendance('${classItem.id}')">
                        <span class="action-icon">📱</span>
                        QR-код
                    </button>
                    
                    <button class="action-btn ai-btn" onclick="app.openAIAttendance('${classItem.id}')">
                        <span class="action-icon">🤖</span>
                        AI-система
                    </button>
                </div>
            </div>
        `).join('');
    }

    showPage(pageName) {
        this.currentPage = pageName;
        
        // Обновляем навигацию
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="app.showPage('${pageName}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.loadPageContent(pageName);
    }

    async loadPageContent(pageName) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        switch (pageName) {
            case 'dashboard':
                await this.loadSchedule();
                this.renderSchedule();
                break;
                
            case 'history':
                mainContent.innerHTML = await this.getHistoryPage();
                break;
                
            case 'profile':
                mainContent.innerHTML = this.getProfilePage();
                break;
                
            default:
                mainContent.innerHTML = '<h2>Страница в разработке</h2>';
        }
    }

    async getHistoryPage() {
        return `
            <div class="page-header">
                <h1>История посещаемости</h1>
                <div class="history-controls">
                    <input type="date" id="start-date">
                    <input type="date" id="end-date">
                    <button class="filter-btn" onclick="app.filterHistory()">Применить</button>
                </div>
            </div>
            <div class="history-container" id="history-container">
                <div class="loading-message">Загрузка истории...</div>
            </div>
        `;
    }

    getProfilePage() {
        return `
            <div class="page-header">
                <h1>Профиль преподавателя</h1>
            </div>
            <div class="profile-container">
                <div class="profile-card">
                    <div class="profile-avatar">👨‍🏫</div>
                    <h2>${this.currentUser?.name || 'Преподаватель'}</h2>
                    <p class="profile-email">${this.currentUser?.email || 'Email не указан'}</p>
                    <div class="profile-stats">
                        <div class="stat">Группы: <strong>${this.groups.length}</strong></div>
                        <div class="stat">Студенты: <strong>${this.students.length}</strong></div>
                        <div class="stat">Предметы: <strong>${this.subjects.length}</strong></div>
                    </div>
                    <div class="profile-actions">
                        <button class="btn-secondary" onclick="app.editProfile()">Редактировать профиль</button>
                    </div>
                </div>
            </div>
        `;
    }

    openManualAttendance(classId) {
        // Переходим на страницу ручной отметки с передачей ID занятия
        window.location.href = `/pages/manual-attendance.html?classId=${classId}`;
    }

    openQRAttendance(classId) {
        // Переходим на страницу QR-отметки
        window.location.href = `/pages/qr-attendance.html?classId=${classId}`;
    }

    openAIAttendance(classId) {
        // Переходим на страницу AI-камеры
        alert('AI-система будет реализована в следующей версии');
        // window.location.href = `/pages/ai-cameras.html?classId=${classId}`;
    }

    async filterHistory() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        console.log('Фильтрация истории:', { startDate, endDate });
        
        // TODO: Реализовать загрузку отфильтрованной истории
        const container = document.getElementById('history-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>История посещаемости</h3>
                    <p>Функция находится в разработке</p>
                </div>
            `;
        }
    }

    editProfile() {
        alert('Редактирование профиля будет доступно в следующем обновлении');
    }

    onGroupChange(groupId) {
        this.currentGroup = groupId;
        console.log('Выбрана группа:', groupId);
        // Можно добавить фильтрацию расписания по группе
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'form.html';
    }

    showError(message) {
        // Можно заменить на красивый toast-уведомление
        console.error('Ошибка:', message);
        alert(message);
    }

    // 🔥 ДИАГНОСТИКА
    async debugSystem() {
        console.log('=== ДИАГНОСТИКА СИСТЕМЫ ===');
        await apiClient.testAllEndpoints();
    }
}

// Инициализация приложения
const app = new AttendanceApp();
window.app = app;