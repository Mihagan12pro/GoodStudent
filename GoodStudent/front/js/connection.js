async function testBackendConnection() {
    try {
        const response = await fetch('https://localhost:7298/api/students');
        if (response.ok) {
            const students = await response.json();
            console.log('C# бэкенд подключен успешно! Студенты:', students);
            return true;
        }
    } catch (error) {
        console.log('C# бэкенд недоступен, используем Node.js fallback');
        return false;
    }
}
testBackendConnection();