process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
const C_SHARP_BACKEND_URL = 'https://localhost:7298';
import { fileURLToPath } from 'url';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  console.log('Serving auth form (form.html)');
  res.sendFile(path.join(__dirname, 'pages', 'form.html'));
});
app.use('/api/csharp', async (req, res) => {
  try {
    const originalUrl = req.originalUrl.replace('/api/csharp', '/api');
    const targetUrl = `${C_SHARP_BACKEND_URL}${originalUrl}`;    
    console.log(`Proxying to C# backend: ${req.method} ${targetUrl}`); 

    const fetchOptions =  {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
              }
      };
      if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }    
    const response = await fetch(targetUrl, fetchOptions);    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('C# backend proxy error:', error);
    res.status(500).json({ error: 'Connection to backend failed' });
  }
});
app.get('/main', (req, res) => {
  console.log('Serving main page (index.html)');
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
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
app.get('/api/students', async (req, res) => {
  try {
    const response = await fetch(`${C_SHARP_BACKEND_URL}/api/students`);
    const students = await response.json();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students from C# backend:', error);
    res.json([
      { id: 1, name: "Иванов Алексей", group: "231-324", email: "ivanov@edu.ru" },
      { id: 2, name: "Петрова Мария", group: "231-324", email: "petrova@edu.ru" }
    ]);
  }
});
app.get('/api/groups/:groupId/students', (req, res) => {
  const groupId = req.params.groupId;
  console.log('GET /api/groups/' + groupId + '/students');
  const groupStudents = students.filter(student => student.group === groupId);
  res.json(groupStudents);
});
app.post('/api/attendance', async (req, res) => {
  try {
    const { attendanceData } = req.body;
    if (!C_SHARP_BACKEND_URL) {
      throw new Error('C# backend URL not configured');
    }
    const csharpPayload = attendanceData.map(item => ({
      studentId: item.studentData.id,
      present: item.present,
      date: new Date().toISOString()
    }));   
    const response = await fetch(`${C_SHARP_BACKEND_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(csharpPayload)
    });    
    if (response.ok) {
      res.json({ success: true, message: 'Посещаемость сохранена в C# бэкенде' });
    } else {
      throw new Error('C# backend error');
    }
  } catch (error) {
    console.error('Error saving to C# backend:', error);
    attendanceRecords.push({
      date: new Date().toISOString(),
      records: req.body.attendanceData
    });
    res.json({ success: true, message: 'Посещаемость сохранена локально' });
  }
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
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});
// app.get('/GoodStudent/front/script.js', (req, res) => {
//   res.sendFile(path.join(__dirname, 'script.js'));
// });
app.get('/admin-dashboard.html', (req, res) => {
  console.log('Serving admin dashboard page');
  res.sendFile(path.join(__dirname, 'pages', 'admin-dashboard.html'));
});
app.get('/form.html', (req, res) => {
  console.log('Serving form.html');
  res.sendFile(path.join(__dirname, 'pages', 'form.html'));
});
app.post('/api/upload-schedule', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    console.log('Загружен файл:', req.file.originalname);
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log('Данные из Excel:', jsonData);
    const students = jsonData.map(row => {
      const id = row['id'] || row['ID'] || row['Id'] || generateId();
      const name = row['name'] || row['Name'] || row['ФИО'] || row['ФИО студента'] || 'Неизвестный';
      const group = row['group'] || row['Group'] || row['Группа'] || 'Неизвестная группа';
      return {
        id: id,
        name: name,
        group: group
      };
    });
    const uniqueGroups = [...new Set(students.map(s => s.group))].map(group => ({
      name: group
    }));
    res.json({
      success: true,
      students: students,
      groups: uniqueGroups,
      message: `Найдено ${students.length} студентов в ${uniqueGroups.length} группах`
    });
  } catch (error) {
    console.error('Ошибка парсинга Excel:', error);
    res.status(500).json({ error: 'Ошибка обработки файла' });
  }
});
function generateId() {
  return 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}
app.post('/api/save-students', async (req, res) => {
  try {
    const { students, groups } = req.body;    
    console.log('Сохранение данных:', { students, groups });
    const groupPromises = groups.map(group => 
      fetch(`${C_SHARP_BACKEND_URL}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group)
      })
    );
    const studentPromises = students.map(student =>
      fetch(`${C_SHARP_BACKEND_URL}/api/students`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student)
      })
    );
    await Promise.all([...groupPromises, ...studentPromises]);
    res.json({
      success: true,
      message: `Сохранено ${students.length} студентов и ${groups.length} групп`
    });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ error: 'Ошибка сохранения данных' });
  }
});
app.get('/test-backend', async (req, res) => {
    try {
        const r = await fetch('https://localhost:7298/weatherforecast');
        const data = await r.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(PORT, () => {
  console.log('=' .repeat(50));
  console.log(`Node.js сервер запущен на http://localhost:${PORT}`);
  console.log('=' .repeat(50));
  console.log(`Логин: любой email`);
  console.log(`Пароль: любой пароль`);
  console.log('');
  console.log('ДОСТУПНЫЕ СТРАНИЦЫ:');
  console.log(`Главная: http://localhost:${PORT}`);
  console.log(`Авторизация: http://localhost:${PORT}/form.html`);
  console.log(`http://localhost:${PORT}/dashboard.html`);
  console.log('=' .repeat(50));
});