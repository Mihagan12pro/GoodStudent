import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5173;
app.use(cors({
    origin: ['https://localhost:7298', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors());
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
const httpsAgent = new https.Agent({
    rejectUnauthorized: false 
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});
app.get('/form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/dashboard.html'));
});
app.get('/manual-attendance.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/manual-attendance.html'));
});
app.get('/qr-attendance.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/qr-attendance.html'));
});
app.use('/api', async (req, res) => {
    try {
        const целевойURL = `https://localhost:7298/api${req.url}`;   
        console.log(`Проксирование: ${req.method} ${req.url} -> ${целевойURL}`);  
        const настройкиЗапроса = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...req.headers
            },
            agent: httpsAgent
        };
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            настройкиЗапроса.body = JSON.stringify(req.body);
        }
        const ответ = await fetch(целевойURL, настройкиЗапроса);
        const типКонтента = ответ.headers.get('content-type');
        if (типКонтента) {
            res.setHeader('Content-Type', типКонтента);
        }
        res.status(ответ.status);
        const данные = await ответ.text();
        res.send(данные);
        
    } catch (ошибка) {
        console.error('Ошибка прокси:', ошибка);
        res.status(500).json({ 
            ошибка: 'Не удалось подключиться к бэкенду',
            сообщение: ошибка.message,
            детали: 'Проверьте запущен ли C# бэкенд на https://localhost:7298'
        });
    }
});
app.get('/test-proxy', async (req, res) => {
    try {
        const ответ = await fetch('https://localhost:7298/api/Groups', {
            agent: httpsAgent
        });
        
        if (ответ.ok) {
            const данные = await ответ.json();
            res.json({ 
                успех: true, 
                сообщение: 'Подключение к бэкенду через прокси успешно',
                данные: данные 
            });
        } else {
            res.status(500).json({ 
                успех: false, 
                сообщение: `Бэкенд ответил со статусом: ${ответ.status}` 
            });
        }
    } catch (ошибка) {
        res.status(500).json({ 
            успех: false, 
            сообщение: 'Тест прокси не удался',
            ошибка: ошибка.message 
        });
    }
});
app.get('/health', (req, res) => {
    res.json({ 
        статус: 'OK', 
        фронтенд: 'Запущен', 
        временнаяМетка: new Date().toISOString() 
    });
});
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`Фронтенд сервер запущен на http://localhost:${PORT}`);
    console.log('='.repeat(60));
    console.log('Доступные страницы:');
    console.log(`Главная: http://localhost:${PORT}/ (form.html)`);
    console.log(`Преподаватель: http://localhost:${PORT}/index.html`);
    console.log(`Администратор: http://localhost:${PORT}/admin-dashboard.html`);
    console.log(`Панель управления: http://localhost:${PORT}/dashboard.html`);
    console.log(`Ручная отметка: http://localhost:${PORT}/manual-attendance.html`);
    console.log(`QR отметка: http://localhost:${PORT}/qr-attendance.html`);
    console.log('='.repeat(60));
    console.log('API Прокси:');
    console.log(`Фронтенд API: http://localhost:${PORT}/api/*`);
    console.log(`Бэкенд API: https://localhost:7298/api/*`);
    console.log('='.repeat(60));
    console.log('Тестовые endpoints:');
    console.log(`Проверка здоровья: http://localhost:${PORT}/health`);
    console.log(`Тест прокси: http://localhost:${PORT}/test-proxy`);
    console.log('='.repeat(60));
});