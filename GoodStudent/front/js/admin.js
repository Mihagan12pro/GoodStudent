class AdminApp {
    constructor() {
        if (!localStorage.getItem('authToken')) {
            window.location.href = '/form.html';
            return;
        }       
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        this.uploadedData = null;
        this.init();
    }
    init() {
        console.log('Инициализация панели заведующего...');
        this.setupEventListeners();
        this.updateUserInfo();
        this.displayCurrentDate(); 
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
    showLoading() {
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Загрузка...';
        }
    }
    hideLoading() {
        const uploadBtn = document.getElementById('upload-btn');
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Загрузить файл';
        }
    }
    setupEventListeners() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('excel-file');
        const uploadBtn = document.getElementById('upload-btn');      
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));      
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        uploadBtn.addEventListener('click', () => this.uploadFile());
        // document.getElementById('edit-data').addEventListener('click', () => this.openEditModal());
        // document.getElementById('save-data').addEventListener('click', () => this.saveData());        
        document.getElementById('admin-logout').addEventListener('click', () => this.logout());
    }
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.style.background = '#f0f2ff';
    }
    handleFileDrop(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    processFile(file) {
        console.log('Обработка файла:', file.name);  
        const formData = new FormData();
        formData.append('excelFile', file);
        this.showLoading();        
        fetch('/api/upload-schedule', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.uploadedData = data.students; 
                this.showPreview();
                this.updateStats();
            } else {
                alert('Ошибка: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Ошибка загрузки:', error);
            alert('Ошибка загрузки файла');
        })
        .finally(() => {
            this.hideLoading();
        });
    }
    showPreview() {
        const studentsList = document.getElementById('students-list');
        if (studentsList && this.uploadedData) {
            studentsList.innerHTML = this.generateStudentsHTML();
        }
    }
    generateStudentsHTML() {
        if (!this.uploadedData || this.uploadedData.length === 0) {
            return '<p>Нет данных для отображения</p>';
        }        
        return this.uploadedData.map(student => `
            <div class="student-item">
                <div class="student-info">
                    <div class="student-name">${student.name}</div>
                    <div class="student-email">Группа: ${student.group}</div>
                </div>
            </div>
        `).join('');
    }
    updateStats() {
        if (this.uploadedData) {
            document.getElementById('total-students').textContent = this.uploadedData.length;
            document.getElementById('students-count').textContent = this.uploadedData.length;
            const uniqueGroups = [...new Set(this.uploadedData.map(s => s.group))];
            document.getElementById('total-groups').textContent = uniqueGroups.length;
        }
    }
    uploadFile() {
        const fileInput = document.getElementById('excel-file');
        if (fileInput.files.length > 0) {
            this.processFile(fileInput.files[0]);
        } else {
            alert('Выберите файл для загрузки');
        }
    }
    updateUserInfo() {
        const nameElement = document.getElementById('admin-name');
        if (nameElement && this.currentUser.name) {
            nameElement.textContent = this.currentUser.name;
        }
    }
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/form.html';
    }
}
const adminApp = new AdminApp();