async function testBackendConnection() {
    try {
        const response = await fetch('https://localhost:7298/api/students');
        if (response.ok) {
            const students = await response.json();
            console.log('бэкенд подключен! Студенты:', students);
            return true;
        }
    } catch (error) {
        console.log('бэкенд недоступен, используем Node.js fallback');
        return false;
    }
}
testBackendConnection();