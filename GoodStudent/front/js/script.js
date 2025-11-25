document.addEventListener('DOMContentLoaded', function() {
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');    
    function showRegisterForm() {
        console.log('Показываем форму регистрации');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }    
    function showLoginForm() {
        console.log('Показываем форму входа');
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterForm();
        });
    }    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;        
        console.log('Вход:', { email, password });        
        const adminEmails = [
            'kopylov@mospolytech.ru',
            'zav.kafedry@mospolytech.ru', 
            'kopylov.admin@edu.ru',
            'department.head@mospolytech.ru'
        ];        
        const isAdminEmail = adminEmails.includes(email.toLowerCase());
        const userRole = isAdminEmail ? 'admin' : 'teacher';        
        console.log('Email:', email.toLowerCase());
        console.log('isAdminEmail:', isAdminEmail);
        console.log('userRole:', userRole);        
        localStorage.setItem('authToken', 'demo-token');
        localStorage.setItem('user', JSON.stringify({
            name: userRole === 'admin' ? 'Заведующий кафедрой' : 'Преподаватель',
            email: email,
            role: userRole
        }));        
        if (userRole === 'admin') {
            window.location.href = '/admin-dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
    });
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const userType = document.querySelector('input[name="user-type"]:checked').value;                
        if (password !== passwordConfirm) {
            alert('Пароли не совпадают!');
            return;
        }                
        localStorage.setItem('userRole', userType);
        localStorage.setItem('user', JSON.stringify({
            name: userType === 'admin' ? 'Заведующий кафедрой' : 'Преподаватель',
            email: email,
            role: userType   
        }));           
        alert(`Регистрация успешна!\nEmail: ${email}\nТип аккаунта: ${userType === 'admin' ? 'Заведующий кафедрой' : 'Преподаватель'}`);
        if (userType === 'admin') {
            window.location.href = '/admin-dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
    });
});