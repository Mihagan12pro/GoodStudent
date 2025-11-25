import express from 'express';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
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
      const name = row['name'] || row['Name'] || row['ФИО'] || row['ФИО студента'] || 'Неизвестный';
      const group = row['group'] || row['Group'] || row['Группа'] || 'Неизвестная группа';
      const nameParts = name.split(' ');
      const surname = nameParts[0] || '';
      const firstName = nameParts[1] || name;
      const patronymic = nameParts[2] || '';      
      return {
        name: firstName,
        surname: surname,
        patronymic: patronymic,
        group: group,
        fullName: name
      };
    });
    const uniqueGroups = [...new Set(students.map(s => s.group))];
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
app.post('/api/save-excel-data', async (req, res) => {
  try {
    const { students, groups } = req.body;    
    console.log('Сохранение данных из Excel в C# бэкенд:', { 
      studentsCount: students.length, 
      groupsCount: groups.length 
    });
    res.json({
      success: true,
      message: `Данные готовы к сохранению: ${students.length} студентов, ${groups.length} групп`,
      data: {
        students: students,
        groups: groups
      }
    });
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    res.status(500).json({ error: 'Ошибка сохранения данных' });
  }
});
app.get('/', (req, res) => {
  console.log('Serving auth form (form.html)');
  res.sendFile(path.join(__dirname, 'form.html'));
});
app.get('/index.html', (req, res) => {
  console.log('Serving teacher page (index.html)');
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/admin-dashboard.html', (req, res) => {
  console.log('Serving admin dashboard page');
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});
app.get('/form.html', (req, res) => {
  console.log('Serving form.html');
  res.sendFile(path.join(__dirname, 'form.html'));
});
app.get('*', (req, res) => {
  console.log('Redirecting to auth form');
  res.redirect('/');
});
app.listen(PORT, () => {
  console.log('=' .repeat(60));
  console.log(`Node.js сервер запущен на http://localhost:${PORT}`);
  console.log('=' .repeat(60));
  console.log('ФУНКЦИОНАЛ:');
  console.log(`POST /api/upload-schedule - Загрузка Excel файлов`);
  console.log(`POST /api/save-excel-data - Сохранение данных`);
  console.log('');
  console.log('СТРАНИЦЫ:');
  console.log(`Авторизация: http://localhost:${PORT}/`);
  console.log(`Преподаватель: http://localhost:${PORT}/index.html`);
  console.log(`Администратор: http://localhost:${PORT}/admin-dashboard.html`);
  console.log('=' .repeat(60));
  console.log('Студенты и группы загружаются напрямую в C# бэкенд из браузера');
  console.log('=' .repeat(60));
});