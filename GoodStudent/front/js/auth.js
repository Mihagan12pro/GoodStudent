class AuthManager {
    constructor() {
        this.loginForm = document.getElementById('login-form');
        this.init();
    }
    init() {
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        this.checkExistingAuth();
    }
    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = this.loginForm.querySelector('.login-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        try {
            const result = await apiClient.login(email, password);
            
            if (result.success) {
                this.redirectToDashboard();
            } else {
                this.showError(result.message || 'Ошибка авторизации');
            }
            
        } catch (error) {
            this.showError(error.message || 'Неверный email или пароль');
        } finally {
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    checkExistingAuth() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        
        if (token && user) {
            this.redirectToDashboard();
        }
    }
    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }
    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
            text-align: center;
        `;
        this.loginForm.insertBefore(errorDiv, this.loginForm.firstChild);
    }
    logout() {
        apiClient.logout();
        window.location.href = 'index.html';
    }
}