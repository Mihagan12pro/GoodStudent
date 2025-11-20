import express from 'express';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/GoodStudent/front/css', express.static(path.join(__dirname, 'css')));
app.use('/GoodStudent/front/js', express.static(path.join(__dirname, 'js')));
app.use('/GoodStudent/front/images', express.static(path.join(__dirname, 'images')));
app.use('/GoodStudent/front/pages', express.static(path.join(__dirname, 'pages')));
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  console.log('Serving auth form (form.html)');
  res.sendFile(path.join(__dirname, 'pages', 'form.html'));
});
app.get('/main', (req, res) => {
  console.log('Serving main page (index.html)');
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});
app.get('/form.html', (req, res) => {
  console.log('Serving form.html');
  res.sendFile(path.join(__dirname, 'pages', 'form.html'));
});
app.get('/dashboard.html', (req, res) => {
  console.log('Serving dashboard.html');
  res.sendFile(path.join(__dirname, 'pages', 'dashboard.html'));
});
app.get('/manual-attendance.html', (req, res) => {
  console.log('Serving manual-attendance.html');
  res.sendFile(path.join(__dirname, 'pages', 'manual-attendance.html'));
});
app.get('/qr-attendance.html', (req, res) => {
  console.log('Serving qr-attendance.html');
  res.sendFile(path.join(__dirname, 'pages', 'qr-attendance.html'));
});
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('POST /api/auth/login -', email);
  if (email && password) {
    res.json({
      success: true,
      token: 'demo-token-' + Date.now(),
      user: {
        id: 1,
        name: 'Преподаватель',
        email: email,
        role: 'teacher'
      },
      message: 'Авторизация успешна'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Введите email и пароль'
    });
  }
});
app.post('/api/auth/logout', (req, res) => {
  console.log('POST /api/auth/logout');
  res.json({
    success: true,
    message: 'Выход выполнен успешно'
  });
});
let students = [
  { id: 1, name: "Иванов Алексей", group: "231-324", email: "ivanov@edu.ru" },
  { id: 2, name: "Петрова Мария", group: "231-324", email: "petrova@edu.ru" },
  { id: 3, name: "Сидоров Дмитрий", group: "231-324", email: "sidorov@edu.ru" },
  { id: 4, name: "Козлова Анна", group: "231-324", email: "kozlova@edu.ru" },
  { id: 5, name: "Николаев Петр", group: "231-324", email: "nikolaev@edu.ru" }
];
let attendanceRecords = [];
app.get('/api/students', (req, res) => {
  console.log('GET /api/students');
  res.json(students);
});
app.get('/api/groups/:groupId/students', (req, res) => {
  const groupId = req.params.groupId;
  console.log('GET /api/groups/' + groupId + '/students');
  const groupStudents = students.filter(student => student.group === groupId);
  res.json(groupStudents);
});
app.post('/api/attendance', (req, res) => {
  const { attendanceData } = req.body;
  console.log('POST /api/attendance - получены отметки для', attendanceData.length, 'студентов');  
  attendanceRecords.push({
    date: new Date().toISOString(),
    records: attendanceData
  });
  
  res.json({ 
    success: true, 
    message: `Посещаемость сохранена! Отмечено ${attendanceData.length} студентов`
  });
});
app.get('/api/schedule', (req, res) => {
  console.log('GET /api/schedule');
  const schedule = [
    {
      id: 1,
      subject: "Математика",
      time: "09:00 - 10:30",
      group: "231-324",
      room: "Аудитория 101"
    },
    {
      id: 2,
      subject: "Программирование", 
      time: "11:00 - 12:30",
      group: "231-324",
      room: "Аудитория 205"
    }
  ];
  res.json(schedule);
});
app.get('/api/groups', (req, res) => {
  console.log('GET /api/groups');
  const groups = [
    { id: 1, name: "231-324", number: "231-324" },
    { id: 2, name: "231-325", number: "231-325" },
    { id: 3, name: "231-326", number: "231-326" }
  ];
  res.json(groups);
});
app.get('/GoodStudent/front/script.js', (req, res) => {
  console.log('Serving script.js from root');
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/index.html', (req, res) => {
  console.log('Serving index.html from direct link');
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});
app.listen(PORT, () => {
  console.log('=' .repeat(50));
  console.log(`Node.js сервер запущен на http://localhost:${PORT}`);
  console.log('=' .repeat(50));
  console.log(`Обслуживает пути: /GoodStudent/front/...`);
  console.log('');
  console.log('ДЕМО-АВТОРИЗАЦИЯ:');
  console.log(`Логин: любой email`);
  console.log(`Пароль: любой пароль`);
  console.log('');
  console.log('ДОСТУПНЫЕ СТРАНИЦЫ:');
  console.log(`Главная: http://localhost:${PORT}`);
  console.log(`Авторизация: http://localhost:${PORT}/form.html`);
  console.log(`http://localhost:${PORT}/dashboard.html`);
  console.log('=' .repeat(50));
});