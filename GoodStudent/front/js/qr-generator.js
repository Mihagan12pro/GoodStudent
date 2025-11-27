class QRGenerator {
    constructor() {
        this.currentToken = null;
        this.currentLessonId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLessons();
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
            } else {
                document.getElementById('qr-display').style.display = 'none';
            }
        });
    }

    loadLessons() {
        // Просто используем демо-занятия
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
        this.generateLocalQRCode(lessonId);
    }

    generateLocalQRCode(lessonId) {
        const token = this.generateToken();
        // QR-код ведет на страницу отметки студентов
        const qrData = `${window.location.origin}/student-qr.html?token=${token}`;
        this.currentToken = token;
        this.displayQRCode(qrData);
        
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
        this.updateExpiryTime(expiresAt);
        this.updateLessonInfo(lessonId);
        
        // Показываем уведомление
        alert('QR-код сгенерирован! Студенты могут сканировать его для отметки.');
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

    generateToken() {
        return 'tk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateLessonInfo(lessonId) {
        const lessonTitle = document.getElementById('lesson-title');
        const lessonDetails = document.getElementById('lesson-details');
        
        if (lessonId === 'demo-1') {
            lessonTitle.textContent = 'Системы инженерного анализа';
            lessonDetails.textContent = 'Группа: 231-320 | Аудитория: Пр/06 | Время: 12:20 - 13:50';
        } else if (lessonId === 'demo-2') {
            lessonTitle.textContent = 'Базы данных';
            lessonDetails.textContent = 'Группа: 231-323 | Аудитория: Пр/01 | Время: 14:00 - 15:30';
        }
    }

    updateExpiryTime(expiresAt) {
        const expiryElement = document.getElementById('qr-expiry');
        expiryElement.textContent = expiresAt.toLocaleString('ru-RU');
    }

    refreshQRCode() {
        if (!this.currentLessonId) {
            alert('Сначала сгенерируйте QR-код');
            return;
        }
        this.generateQRCode();
    }

    shareQRCode() {
        if (!this.currentToken) {
            alert('Сначала сгенерируйте QR-код');
            return;
        }
        
        const shareUrl = `${window.location.origin}/student-qr.html?token=${this.currentToken}`;
        
        // Копируем в буфер обмена
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Ссылка скопирована в буфер обмена: ' + shareUrl);
        }).catch(() => {
            // Fallback
            const tempInput = document.createElement('input');
            tempInput.value = shareUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('Ссылка скопирована в буфер обмена');
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});