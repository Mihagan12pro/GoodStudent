function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (!user || !pass) {
        alert("Введите логин и пароль");
        return;
    }
    window.location.href = "schedule.html";
}
