import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5173;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Главная страница - форма входа
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// Страница преподавателя
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница администратора
app.get('/admin-dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Форма входа (явный путь)
app.get('/form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// HTTPS агент который игнорирует SSL ошибки
const httpsAgent = new https.Agent({
    rejectUnauthorized: false // ИГНОРИРУЕМ SSL ОШИБКИ
});

// Прокси для API бэкенда
app.use('/api', async (req, res) => {
    try {
        const targetUrl = `https://localhost:7298/api${req.url}`;
        
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            agent: httpsAgent // ДОБАВЛЯЕМ АГЕНТ
        };

        if (req.method !== 'GET' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        console.log(`🔄 Proxying: ${req.method} ${req.url} -> ${targetUrl}`);
        
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.text();
        
        console.log(`✅ Response: ${response.status}`);
        res.status(response.status).send(data);
        
    } catch (error) {
        console.error('❌ Proxy error:', error);
        res.status(500).json({ 
            error: 'Backend connection failed',
            message: error.message 
        });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Express server running on http://localhost:${PORT}`);
    console.log('='.repeat(50));
    console.log('📄 Available pages:');
    console.log(`   Main: http://localhost:${PORT}/ (form.html)`);
    console.log(`   Teacher: http://localhost:${PORT}/index.html`);
    console.log(`   Admin: http://localhost:${PORT}/admin-dashboard.html`);
    console.log('='.repeat(50));
});