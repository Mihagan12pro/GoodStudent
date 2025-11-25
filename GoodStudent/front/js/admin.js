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
        this.setupEventListeners();
        this.displayCurrentDate();
    }
    setupEventListeners() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('excel-file');
        const uploadBtn = document.getElementById('upload-btn');
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
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = 'form.html';
            });
        }
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
            const response = await fetch('/api/upload-schedule', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                this.uploadedData = result;
                this.displayUploadedData();
                alert(result.message);
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
            saveBtn.textContent = 'Сохранить в C# бэкенд';
            saveBtn.style.marginTop = '10px';
            saveBtn.style.width = '100%';
            saveBtn.style.padding = '12px';
            saveBtn.onclick = () => this.saveToBackend();
            
            const uploadArea = document.getElementById('upload-area');
            uploadArea.parentNode.insertBefore(saveBtn, uploadArea.nextSibling);
        }
        saveBtn.style.display = 'block';
    }
    async saveToBackend() {
        if (!this.uploadedData) {
            alert('Нет данных для сохранения');
            return;
        }
        try {
            console.log('Сохранение данных из Excel в C# бэкенд...');
            const results = await apiClient.createStudentsFromExcel(this.uploadedData.students);            
            const successCount = results.filter(r => r.success).length;
            const errorCount = results.filter(r => !r.success).length;            
            if (successCount > 0) {
                alert(`Успешно сохранено в C# бэкенд: ${successCount} студентов\n${errorCount > 0 ? `Ошибок: ${errorCount}` : ''}\n\nПреподаватель теперь увидит этих студентов в своем интерфейсе.`);
            } else {
                alert('Не удалось сохранить ни одного студента');
            }            
            console.log(`Результаты сохранения: ${successCount} успешно, ${errorCount} с ошибками`);            
        } catch (error) {
            console.error('Ошибка сохранения в C# бэкенд:', error);
            alert('Ошибка при сохранении данных в систему');
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
}
const adminApp = new AdminApp();