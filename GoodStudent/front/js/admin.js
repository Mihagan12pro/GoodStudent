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
        document.getElementById('edit-data').addEventListener('click', () => this.openEditModal());
        document.getElementById('save-data').addEventListener('click', () => this.saveData());
        document.getElementById('admin-logout').addEventListener('click', () => this.logout());
        document.getElementById('edit-close').addEventListener('click', () => this.closeEditModal());
        document.getElementById('cancel-edit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('confirm-edit').addEventListener('click', () => this.confirmEdit());
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
        console.log('Выбран файл:', file.name);
        this.showPreview();
    }
    showPreview() {
        document.getElementById('preview-section').classList.remove('hidden');
    }
    openEditModal() {
        document.getElementById('edit-modal').classList.remove('hidden');
    }
    closeEditModal() {
        document.getElementById('edit-modal').classList.add('hidden');
    }
    confirmEdit() {
        this.closeEditModal();
    }
    uploadFile() {
        console.log('Загрузка файла...');
    }
    saveData() {
        console.log('Сохранение данных в систему...');
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