class QRGenerator {
    constructor() {
        this.currentToken = null;
        this.currentLessonId = null;
        this.refreshInterval = null;
        this.autoRefreshInterval = null;
        this.init();
    }
    init() {
        this.loadLessons();
        this.setupEventListeners();
    }
    async loadLessons() {
        try {
            const response = await fetch('/api/instructors/demo-instructor/assignments');
            const assignments = await response.json();
            
            const lessonSelect = document.getElementById('lessonSelect');
            lessonSelect.innerHTML = '<option value="">-- Выберите занятие --</option>';
            
            assignments.forEach(assignment => {
                const option = document.createElement('option');
                option.value = assignment.id;
                option.textContent = `${assignment.subject_name} - ${assignment.group_number} (${new Date(assignment.assignment_date).toLocaleDateString('ru-RU')})`;
                lessonSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Ошибка загрузки занятий:', error);
            this.useDemoLessons();
        }
    }
    useDemoLessons() {
        const lessonSelect = document.getElementById('lessonSelect');
        lessonSelect.innerHTML = `
            <option value="">-- Выберите занятие --</option>
            <option value="demo-1">Системы инженерного анализа - 231-320 (${new Date().toLocaleDateString('ru-RU')})</option>
            <option value="demo-2">Базы данных - 231-323 (${new Date(Date.now() + 86400000).toLocaleDateString('ru-RU')})</option>
        `;
    }
    setupEventListeners() {
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateQRCode();
        });
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.generateQRCode();
        });
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareQRCode();
        });
        document.getElementById('lessonSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('qr-display').style.display = 'block';
            } else {
                document.getElementById('qr-display').style.display = 'none';
            }
        });
    }
    async generateQRCode() {
        const lessonSelect = document.getElementById('lessonSelect');
        const lessonId = lessonSelect.value;
        
        if (!lessonId) {
            alert('Выберите занятие');
            return;
        }
        
        this.currentLessonId = lessonId;
        
        try {
            const response = await fetch('/api/qr/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lessonId: lessonId,
                    instructorId: 'demo-instructor',
                    duration: 10 
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentToken = result.token;
                this.displayQRCode(result.qrData);
                this.updateLessonInfo(lessonId);
                this.updateExpiryTime(result.expiresAt);
                this.startAutoRefresh();
                this.startStatsRefresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Ошибка генерации QR:', error);
            this.generateLocalQRCode(lessonId);
        }
    }
      async refreshQRCode() {
        if (!this.currentToken) return;
        
        try {
            const response = await fetch(`/api/qr/sessions/${this.currentToken}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    duration: 10
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentToken = result.token;
                this.displayQRCode(result.qrData);
                this.updateExpiryTime(result.expiresAt);
                console.log('QR-код обновлен');
            }
        } catch (error) {
            console.error('Ошибка обновления QR:', error);
        }
    }
     startAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
        this.autoRefreshInterval = setInterval(() => {
            this.refreshQRCode();
        }, 10000);
    }
    displayQRCode(qrData) {
        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: qrData,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    generateLocalQRCode(lessonId) {
        const token = this.generateToken();
        const qrData = `${window.location.origin}/api/attendance/qr/${token}`;
        this.currentToken = token;
        this.displayQRCode(qrData);
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
        this.updateExpiryTime(expiresAt);
        this.startStatsRefresh();
    }
    generateToken() {
        return 'tk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    async updateLessonInfo(lessonId) {
        try {
            const response = await fetch('/api/instructors/demo-instructor/assignments');
            const assignments = await response.json();
            const assignment = assignments.find(a => a.id === lessonId);
            
            if (assignment) {
                document.getElementById('lesson-title').textContent = assignment.subject_name;
                document.getElementById('lesson-details').textContent = 
                    `Группа: ${assignment.group_number} | Аудитория: ${assignment.classroom} | Время: ${assignment.start_time} - ${assignment.end_time}`;
            }
        } catch (error) {
            document.getElementById('lesson-title').textContent = 'Занятие';
            document.getElementById('lesson-details').textContent = 'Информация о занятии';
        }
    }
    updateExpiryTime(expiresAt) {
        const expiryElement = document.getElementById('qr-expiry');
        const expiryDate = new Date(expiresAt);
        expiryElement.textContent = expiryDate.toLocaleString('ru-RU');
    }
    async refreshStats() {
        if (!this.currentToken) return;
        
        try {
            const response = await fetch(`/api/qr/session/${this.currentToken}/stats`);
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('marked-count').textContent = result.markedCount;
            }
        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
        }
    }
    startStatsRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.refreshInterval = setInterval(() => {
            this.refreshStats();
        }, 5000); // Обновляем каждые 5 секунд
        this.refreshStats();
    }
    shareQRCode() {
        if (!this.currentToken) {
            alert('Сначала сгенерируйте QR-код');
            return;
        }
        const shareUrl = `${window.location.origin}/api/attendance/qr/${this.currentToken}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'QR-код для отметки посещаемости',
                text: 'Отметьте посещаемость по ссылке',
                url: shareUrl
            });
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('Ссылка скопирована в буфер обмена');
            });
        }
    }
}
function goBack() {
    window.location.href = '/index.html';
}
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});