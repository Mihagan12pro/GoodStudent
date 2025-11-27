class QRGenerator {
    constructor() {
        this.currentToken = null;
        this.currentLessonId = null;
        this.autoRefreshInterval = null;
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.loadLessons();
        this.startAutoRefresh();
    }
    setupEventListeners() {
        document.getElementById('generate-btn').addEventListener('click', () => {
            this.generateQRCode();
        });
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.refreshQRCode();
        });
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareQRCode();
        });
        document.getElementById('lessonSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                document.getElementById('qr-display').style.display = 'block';
                this.updateLessonInfo(e.target.value);
                this.generateQRCode();
            } else {
                document.getElementById('qr-display').style.display = 'none';
                this.stopAutoRefresh();
            }
        });
    }
    loadLessons() {
        const lessonSelect = document.getElementById('lessonSelect');
        const today = new Date().toLocaleDateString('ru-RU');
        
        lessonSelect.innerHTML = `
            <option value="">-- Выберите занятие --</option>
            <option value="demo-1">Системы инженерного анализа - 231-320 (${today})</option>
            <option value="demo-2">Базы данных - 231-323 (${today})</option>
        `;
    }
    generateQRCode() {
        const lessonSelect = document.getElementById('lessonSelect');
        const lessonId = lessonSelect.value;
        if (!lessonId) {
            alert('Выберите занятие');
            return;
        }
        this.currentLessonId = lessonId;
        this.generateNewQRCode();
    }
    generateNewQRCode() {
        const token = this.generateToken();
        const qrData = `http://localhost:5000/student-qr.html?token=${token}&lesson=${this.currentLessonId}`;
        this.currentToken = token;
        this.displayQRCode(qrData);
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
        this.updateExpiryTime(expiresAt);
        this.updateLessonInfo(this.currentLessonId);       
        console.log('Новый QR-код сгенерирован:', new Date().toLocaleTimeString());
        this.updateStats();
    }
    displayQRCode(qrData) {
        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = '';
        
        try {
            new QRCode(qrContainer, {
                text: qrData,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('Ошибка генерации QR:', error);
            qrContainer.innerHTML = '<p style="color: red;">Ошибка генерации QR-кода</p>';
        }
    }
    generateToken() {
        return 'tk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    updateLessonInfo(lessonId) {
        const lessonTitle = document.getElementById('lesson-title');
        const lessonDetails = document.getElementById('lesson-details');
        
        if (lessonId === 'demo-1') {
            lessonTitle.textContent = 'Системы инженерного анализа';
            lessonDetails.textContent = 'Группа: 231-320 | Аудитория: Пр/06';
        } else if (lessonId === 'demo-2') {
            lessonTitle.textContent = 'Базы данных';
            lessonDetails.textContent = 'Группа: 231-323 | Аудитория: Пр/01';
        }
    }
    updateExpiryTime(expiresAt) {
        const expiryElement = document.getElementById('qr-expiry');
        expiryElement.textContent = expiresAt.toLocaleTimeString('ru-RU');
    }
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.autoRefreshInterval = setInterval(() => {
            if (this.currentLessonId) {
                this.generateNewQRCode();
            }
        }, 10000); 
        
        console.log('Автообновление QR-кода запущено (каждые 10 секунд)');
    }
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    refreshQRCode() {
        if (!this.currentLessonId) {
            alert('Сначала выберите занятие');
            return;
        }
        this.generateNewQRCode();
    }
    async updateStats() {
        if (!this.currentToken) return;
        const markedCount = Math.floor(Math.random() * 5); 
        document.getElementById('marked-count').textContent = markedCount;
    }
    shareQRCode() {
        if (!this.currentToken) {
            alert('Сначала сгенерируйте QR-код');
            return;
        }
        
        const shareUrl = `http://localhost:5000/student-qr.html?token=${this.currentToken}&lesson=${this.currentLessonId}`;
        alert(`Ссылка для тестирования:\n${shareUrl}\n\nQR-код обновляется автоматически каждые 10 секунд!`);
        navigator.clipboard.writeText(shareUrl).then(() => {
            console.log('Ссылка скопирована в буфер обмена');
        }).catch(() => {
            const tempInput = document.createElement('input');
            tempInput.value = shareUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        });
    }
    destroy() {
        this.stopAutoRefresh();
    }
}
document.addEventListener('DOMContentLoaded', () => {
    window.qrGenerator = new QRGenerator();
});
window.addEventListener('beforeunload', () => {
    if (window.qrGenerator) {
        window.qrGenerator.destroy();
    }
});