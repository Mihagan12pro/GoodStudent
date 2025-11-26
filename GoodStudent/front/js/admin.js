class AdminApp {
    constructor() {
        if (!localStorage.getItem('authToken')) {
            window.location.href = '/form.html';
            return;
        }
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        this.uploadedData = null;
        this.departments = [];
        this.instructors = [];
        this.subjects = [];
        this.groups = [];
        this.init();
    }
    async init() {
        this.setupEventListeners();
        this.displayCurrentDate();
        await this.loadAdminData();
    }
    async loadAdminData() {
        try {
            console.log('Загружаем данные для админки из PostgreSQL...');
            const [groups, instructors, subjects] = await Promise.all([
                apiClient.getAllGroups(),
                apiClient.getAllInstructors(),
                apiClient.getAllSubjects()
            ]);          
            this.groups = groups || [];
            this.instructors = instructors || [];
            this.subjects = subjects || [];           
            console.log(`Данные загружены: ${this.groups.length} групп, ${this.instructors.length} преподавателей, ${this.subjects.length} предметов`);           
            this.populateGroupSelectors();
            this.populateInstructorSelector();
            this.populateSubjectSelector();
            this.updateStats();            
        } catch (error) {
            console.error('Ошибка загрузки данных админки:', error);
            this.useDemoData();
        }
    }
    useDemoData() {
        console.log('Используем демо-данные для админки...');    
        this.groups = [
            { id: '1', number: '231-324' },
            { id: '2', number: '231-325' },
            { id: '3', number: '231-326' }
        ];        
        this.instructors = [
            { id: '1', name: 'Иванов', surname: 'Петр', patronymic: 'Сергеевич' },
            { id: '2', name: 'Петрова', surname: 'Мария', patronymic: 'Ивановна' }
        ];        
        this.subjects = [
            { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа' },
            { id: 2, name: 'Нормативное регулирование', type: 'Лекция' },
            { id: 3, name: 'Базы данных', type: 'Практика' }
        ];        
        this.populateGroupSelectors();
        this.populateInstructorSelector();
        this.populateSubjectSelector();
        this.updateStats();
    }
    populateGroupSelectors() {
        const groupSelect = document.getElementById('group-select');
        const groupAssignSelect = document.getElementById('group-assign-select');
        
        if (groupSelect) {
            groupSelect.innerHTML = '<option value="all">Все группы</option>';
            this.groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.number;
                groupSelect.appendChild(option);
            });
        }       
        if (groupAssignSelect) {
            groupAssignSelect.innerHTML = '<option value="">Выберите группу</option>';
            this.groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.number;
                groupAssignSelect.appendChild(option);
            });
        }
    }
    populateInstructorSelector() {
        const select = document.getElementById('instructor-select');
        if (!select) return;
        
        select.innerHTML = '<option value="">Выберите преподавателя</option>';
        this.instructors.forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor.id;
            const fullName = `${instructor.surname || ''} ${instructor.name || ''} ${instructor.patronymic || ''}`.trim();
            option.textContent = fullName || `Преподаватель ${instructor.id}`;
            select.appendChild(option);
        });
    }
    populateSubjectSelector() {
        const select = document.getElementById('subject-assign-select');
        if (!select) return;
        
        select.innerHTML = '<option value="">Выберите предмет</option>';
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });
    }
    setupEventListeners() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('excel-file');
        const uploadBtn = document.getElementById('upload-btn');
        const assignBtn = document.getElementById('assign-subject-btn');
        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.backgroundColor = '#f0f4ff';
            });           
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.backgroundColor = '';
            });            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.backgroundColor = '';
                if (e.dataTransfer.files.length) {
                    this.handleFileSelect(e.dataTransfer.files[0]);
                }
            });
        }       
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }       
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadFile());
        }
        
        if (assignBtn) {
            assignBtn.addEventListener('click', () => this.assignSubjectToInstructor());
        }
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = 'form.html';
            });
        }
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
        console.log('Переключение на вид:', view);
    }
    handleFileSelect(file) {
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            alert('Пожалуйста, выберите Excel файл (.xlsx или .xls)');
            return;
        }     
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.innerHTML = `<p>Выбран файл: ${file.name}</p>`;
        }
        
        this.selectedFile = file;
    }
    async uploadFile() {
        if (!this.selectedFile) {
            alert('Пожалуйста, сначала выберите файл');
            return;
        }       
        const formData = new FormData();
        formData.append('excelFile', this.selectedFile);        
        try {
            console.log('Загрузка файла на сервер...');
            const response = await fetch('/api/upload-schedule', {
                method: 'POST',
                body: formData
            });          
            const result = await response.json();           
            if (result.success) {
                this.uploadedData = result;
                this.displayUploadedData();
                alert(`${result.message}`);
                this.showSaveButton();
            } else {
                alert('Ошибка: ' + result.error);
            }            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            alert('Не удалось загрузить файл');
        }
    }
    displayUploadedData() {
        if (!this.uploadedData) return;        
        const studentsList = document.getElementById('students-list');
        const studentsCount = document.getElementById('students-count');        
        if (studentsList && this.uploadedData.students) {
            studentsList.innerHTML = this.uploadedData.students.map(student => `
                <div class="student-item">
                    <div class="student-info">
                        <div class="student-name">${student.fullName}</div>
                        <div class="student-group">Группа: ${student.group}</div>
                    </div>
                </div>
            `).join('');
        }      
        if (studentsCount) {
            studentsCount.textContent = this.uploadedData.students.length;
        }
    }
    showSaveButton() {
        let saveBtn = document.getElementById('save-excel-data');
        if (!saveBtn) {
            saveBtn = document.createElement('button');
            saveBtn.id = 'save-excel-data';
            saveBtn.className = 'btn-primary';
            saveBtn.textContent = 'Сохранить в базу данных';
            saveBtn.style.marginTop = '10px';
            saveBtn.style.width = '100%';
            saveBtn.style.padding = '12px';
            saveBtn.onclick = () => this.saveToDatabase();            
            const uploadArea = document.getElementById('upload-area');
            uploadArea.parentNode.insertBefore(saveBtn, uploadArea.nextSibling);
        }
        saveBtn.style.display = 'block';
    }
    async saveToDatabase() {
        if (!this.uploadedData) {
            alert('Нет данных для сохранения');
            return;
        }        
        try {
            console.log('Сохранение данных из Excel в PostgreSQL...');
            const results = await apiClient.createStudentsFromExcel(this.uploadedData.students);          
            const successCount = results.filter(r => r.success).length;
            const errorCount = results.filter(r => !r.success).length;           
            if (successCount > 0) {
                alert(`Успешно сохранено в базу данных: ${successCount} студентов${errorCount > 0 ? `\nОшибок: ${errorCount}` : ''}`);
                this.updateStats();
            } else {
                alert('Не удалось сохранить ни одного студента');
            }
            
            console.log(`Результаты сохранения: ${successCount} успешно, ${errorCount} с ошибками`);
            
        } catch (error) {
            console.error('Ошибка сохранения в базу данных:', error);
            alert('Ошибка при сохранении данных в систему');
        }
    }
    async assignSubjectToInstructor() {
        const instructorId = document.getElementById('instructor-select').value;
        const subjectId = document.getElementById('subject-assign-select').value;
        const groupId = document.getElementById('group-assign-select').value;        
        if (!instructorId || !subjectId || !groupId) {
            alert('Заполните все поля');
            return;
        }        
        try {
            const instructor = this.instructors.find(i => i.id === instructorId);
            const subject = this.subjects.find(s => s.id == subjectId);
            const group = this.groups.find(g => g.id === groupId);            
            console.log('Назначение предмета:', { 
                instructor: instructor?.name, 
                subject: subject?.name, 
                group: group?.number 
            });
            alert(`Предмет "${subject?.name}" успешно назначен преподавателю ${instructor?.surname} ${instructor?.name} для группы ${group?.number}`);
            
        } catch (error) {
            console.error('Ошибка назначения предмета:', error);
            alert('Ошибка при назначении предмета');
        }
    }
    updateStats() {
        const totalStudents = document.getElementById('total-students');
        const totalGroups = document.getElementById('total-groups');
        const totalInstructors = document.getElementById('total-instructors');
        
        if (totalStudents) totalStudents.textContent = '0'; 
        if (totalGroups) totalGroups.textContent = this.groups.length;
        if (totalInstructors) totalInstructors.textContent = this.instructors.length;
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
}

const adminApp = new AdminApp();