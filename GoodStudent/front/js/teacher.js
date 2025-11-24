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
        this.currentGroupId = null;
        this.init();
    }

    async init() {
        console.log('🎯 Инициализация приложения...');
        
        await this.loadGroups();
        await this.loadAllStudents();
        this.setupNavigation();
        this.setupEventListeners();
        this.displayCurrentDate();
        this.generateCalendar();
        this.setupAttendanceButton();
    }

    // 🔹 Загрузка всех студентов
    async loadAllStudents() {
        try {
            console.log('📥 Загрузка студентов из бэкенда...');
            const students = await apiClient.getStudents();
            console.log('✅ Студенты из API:', students);
            
            this.students = this.transformStudentsData(students);
            console.log('🔄 Преобразованные студенты:', this.students);
            
            this.renderStudents();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки студентов:', error);
            this.students = this.getMockStudents();
            this.renderStudents();
            this.updateStats();
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
    // 🔹 Преобразование данных студентов
    transformStudentsData(studentsData) {
        if (!studentsData || !Array.isArray(studentsData)) {
            console.warn('⚠️ Нет данных студентов или неверный формат');
            return [];
        }

        return studentsData.map(student => {
            // Формируем полное имя
            const fullName = `${student.surname || ''} ${student.name || ''} ${student.patronymic || ''}`.trim();
            
            // Получаем номер группы
            let groupNumber = 'Не указана';
            if (student.group && student.group.number) {
                groupNumber = student.group.number;
            }

            return {
                id: student.id || Math.random().toString(36).substr(2, 9),
                name: fullName || `Студент ${student.id}`,
                group: groupNumber,
                present: false
            };
        });
    }

    // 🔹 Загрузка групп
    async loadGroups() {
        try {
            console.log('📥 Загрузка групп...');
            this.groups = await apiClient.getGroups();
            console.log('✅ Группы загружены:', this.groups);
            this.populateGroupSelector();
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки групп, используем демо-данные:', error);
            this.groups = this.getMockGroups();
            this.populateGroupSelector();
        }
    }

    populateGroupSelector() {
        const select = document.getElementById('group-select');
        if (!select) {
            console.error('❌ Элемент group-select не найден');
            return;
        }

        const currentValue = select.value;
        select.innerHTML = '';
        
        // Добавляем опцию "Все группы"
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Все группы';
        select.appendChild(allOption);

        // Добавляем группы
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

    // 🔹 Рендеринг списка студентов
    renderStudents() {
        const container = document.getElementById('students-list');
        if (!container) {
            console.error('❌ Элемент students-list не найден');
            return;
        }                
        
        if (this.students.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Нет студентов для отображения</p>';
            return;
        }              

        // Фильтрация по группе
        let filteredStudents = this.students;
        if (this.currentGroupId && this.currentGroupId !== 'all') {
            const selectedGroup = this.groups.find(g => g.id === this.currentGroupId);
            if (selectedGroup) {
                filteredStudents = this.students.filter(student => 
                    student.group === selectedGroup.number
                );
            }
        }

        container.innerHTML = filteredStudents.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-group">Группа: ${student.group}</div>
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

    // 🔹 Остальные методы остаются без изменений...
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
        
        if (presentStudents.length === 0) {
            if (!confirm('Ни один студент не отмечен как присутствующий. Сохранить пустую посещаемость?')) {
                return;
            }
        }

        const attendanceData = {
            date: new Date().toISOString(),
            students: this.students.map(student => ({
                studentId: student.id,
                studentName: student.name,
                present: student.present,
                group: student.group
            }))
        };

        try {
            console.log('💾 Сохранение посещаемости:', attendanceData);
            const result = await apiClient.markAttendance(attendanceData);
            
            alert('✅ Посещаемость успешно сохранена!');
            console.log(`📊 Отмечено присутствующих: ${presentStudents.length} из ${this.students.length}`);
            
        } catch (error) {
            console.error('❌ Ошибка сохранения посещаемости:', error);
            alert('❌ Ошибка при сохранении посещаемости.');
        }
    }

    // 🔹 Демо-данные
    getMockGroups() {
        return [
            { id: '1', number: "231-324" },
            { id: '2', number: "231-325" },
            { id: '3', number: "231-326" }
        ];
    }

    getMockStudents() {
        return [
            { id: '1', name: "Иванов Алексей Петрович", group: "231-324", present: false },
            { id: '2', name: "Петрова Мария Сергеевна", group: "231-324", present: true },
            { id: '3', name: "Сидоров Дмитрий Иванович", group: "231-325", present: false },
            { id: '4', name: "Козлова Анна Владимировна", group: "231-326", present: true }
        ];
    }

    // 🔹 Остальные методы без изменений...
    async loadStudentsForAttendance() {
        const saveButton = document.getElementById('save-attendance-btn');
        if (saveButton) {
            saveButton.style.display = 'block';
        }
        await this.loadAllStudents();
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

    // ... остальные методы без изменений
}

const teacherApp = new TeacherApp();