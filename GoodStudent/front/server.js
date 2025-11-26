import express from 'express';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
const { Pool } = pg;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

const poolConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'goodStudent_studentsDb',
  password: '1234567890',
  port: 5432,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
};

const pool = new Pool(poolConfig);

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

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

app.get('/api/students', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT s."Id", s."name", s."surname", s."patronymic", s."GroupId", s."status", g."number" as "group_number" FROM students s LEFT JOIN groups g ON s."GroupId" = g."Id" ORDER BY s."surname", s."name" LIMIT 100`);
    const students = result.rows.map(student => ({id: student.Id, name: student.name, surname: student.surname, patronymic: student.patronymic, groupId: student.GroupId, groupName: student.group_number || 'Не указана', status: student.status}));
    res.json(students);
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error);
    res.status(500).json({ error: 'Ошибка загрузки студентов' });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/groups', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT "Id", "number", "profession_id" FROM groups ORDER BY "number" LIMIT 50`);
    const groups = result.rows.map(row => ({id: row.Id, number: row.number, professionId: row.profession_id}));
    res.json(groups);
  } catch (error) {
    console.error('Ошибка загрузки групп:', error);
    res.status(500).json({ error: 'Ошибка загрузки групп' });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/instructors', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT "Id", "name", "surname", "patronymic", "department_id", "email" FROM instructors ORDER BY "surname", "name"`);
    const instructors = result.rows.map(row => ({id: row.Id, name: row.name, surname: row.surname, patronymic: row.patronymic, departmentId: row.department_id, email: row.email}));
    res.json(instructors);
  } catch (error) {
    console.error('Ошибка загрузки преподавателей:', error);
    res.status(500).json({ error: 'Ошибка загрузки преподавателей' });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/departments', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT "Id", "tittle", "description", "faculty_id" FROM departments ORDER BY "tittle"`);
    const departments = result.rows.map(row => ({id: row.Id, tittle: row.tittle, description: row.description, facultyId: row.faculty_id}));
    res.json(departments);
  } catch (error) {
    console.error('Ошибка загрузки кафедр:', error);
    res.status(500).json({ error: 'Ошибка загрузки кафедр' });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/subjects', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT "Id", "name", "type", "department_id" FROM subjects ORDER BY "name"`);
    const subjects = result.rows.map(row => ({id: row.Id, name: row.name, type: row.type, departmentId: row.department_id}));
    res.json(subjects);
  } catch (error) {
    console.error('Ошибка загрузки предметов:', error);
    res.status(500).json({ error: 'Ошибка загрузки предметов' });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/assignments', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT ia."Id", ia."instructor_id", ia."subject_id", ia."group_id", ia."department_id", ia."created_at", i."name" as "instructor_name", i."surname" as "instructor_surname", i."patronymic" as "instructor_patronymic", s."name" as "subject_name", g."number" as "group_number", d."tittle" as "department_name" FROM instructor_assignments ia LEFT JOIN instructors i ON ia."instructor_id" = i."Id" LEFT JOIN subjects s ON ia."subject_id" = s."Id" LEFT JOIN groups g ON ia."group_id" = g."Id" LEFT JOIN departments d ON ia."department_id" = d."Id" ORDER BY ia."created_at" DESC`);
    const assignments = result.rows.map(row => ({id: row.Id, instructor_id: row.instructor_id, instructor_name: row.instructor_name, instructor_surname: row.instructor_surname, instructor_patronymic: row.instructor_patronymic, subject_id: row.subject_id, subject_name: row.subject_name, group_id: row.group_id, group_number: row.group_number, department_id: row.department_id, department_name: row.department_name, created_at: row.created_at}));
    res.json(assignments);
  } catch (error) {
    console.error('Ошибка загрузки назначений:', error);
    res.status(500).json({ error: 'Ошибка загрузки назначений' });
  } finally {
    if (client) client.release();
  }
});

app.post('/api/assignments', async (req, res) => {
  let client;
  try {
    const { instructorId, subjectId, groupId, departmentId } = req.body;
    console.log('Создание назначения:', { instructorId, subjectId, groupId, departmentId });
    client = await pool.connect();
    const assignmentId = generateUUID();
    const result = await client.query(`INSERT INTO instructor_assignments ("Id", "instructor_id", "subject_id", "group_id", "department_id") VALUES ($1, $2, $3, $4, $5) RETURNING "Id"`, [assignmentId, instructorId, subjectId, groupId, departmentId]);
    res.json({ id: assignmentId, success: true });
  } catch (error) {
    console.error('Ошибка создания назначения:', error);
    res.status(500).json({ error: 'Ошибка создания назначения: ' + error.message });
  } finally {
    if (client) client.release();
  }
});

app.get('/api/instructors/:id/assignments', async (req, res) => {
  let client;
  try {
    const instructorId = req.params.id;
    client = await pool.connect();
    const result = await client.query(`SELECT ia."Id", ia."subject_id", ia."group_id", s."name" as "subject_name", g."number" as "group_number" FROM instructor_assignments ia LEFT JOIN subjects s ON ia."subject_id" = s."Id" LEFT JOIN groups g ON ia."group_id" = g."Id" WHERE ia."instructor_id" = $1`, [instructorId]);
    const assignments = result.rows.map(row => ({id: row.Id, subject_id: row.subject_id, subject_name: row.subject_name, group_id: row.group_id, group_number: row.group_number}));
    res.json(assignments);
  } catch (error) {
    console.error('Ошибка загрузки назначений преподавателя:', error);
    res.status(500).json({ error: 'Ошибка загрузки назначений' });
  } finally {
    if (client) client.release();
  }
});

app.delete('/api/assignments/:id', async (req, res) => {
  let client;
  try {
    const assignmentId = req.params.id;
    client = await pool.connect();
    await client.query('DELETE FROM instructor_assignments WHERE "Id" = $1', [assignmentId]);
    res.json({ success: true, message: 'Назначение удалено' });
  } catch (error) {
    console.error('Ошибка удаления назначения:', error);
    res.status(500).json({ error: 'Ошибка удаления назначения' });
  } finally {
    if (client) client.release();
  }
});

app.post('/api/students', async (req, res) => {
  let client;
  try {
    const { name, surname, patronymic, groupId, status } = req.body;
    console.log('Создание студента:', { name, surname, groupId });
    client = await pool.connect();
    const studentId = generateUUID();
    const result = await client.query(`INSERT INTO students ("Id", "name", "surname", "patronymic", "GroupId", "status") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "Id"`, [studentId, name, surname, patronymic || '', groupId, status || 0]);
    res.json({ id: studentId, success: true });
  } catch (error) {
    console.error('Ошибка создания студента:', error);
    res.status(500).json({ error: 'Ошибка создания студента: ' + error.message });
  } finally {
    if (client) client.release();
  }
});
app.post('/api/groups', async (req, res) => {
  let client;
  try {
    const { number } = req.body;
    console.log('Создание группы:', { number });
    
    client = await pool.connect();
    
    const checkQuery = 'SELECT "Id" FROM groups WHERE "number" = $1';
    const checkResult = await client.query(checkQuery, [number]);
    
    if (checkResult.rows.length > 0) {
      return res.json({ 
        id: checkResult.rows[0].Id,
        exists: true 
      });
    }
    
    const query = `
      INSERT INTO groups ("Id", "number", "profession_id")
      VALUES ($1, $2, $3)
      RETURNING "Id"
    `;    
    
    const groupId = generateUUID();
    const result = await client.query(query, [
      groupId,
      number, 
      "3fa85f64-5717-4562-b3fc-2c963f66afa6" 
    ]);   
    
    res.json({ 
      id: groupId,
      success: true 
    });    
    
  } catch (error) {
    console.error('Ошибка создания группы:', error);
    res.status(500).json({ error: 'Ошибка создания группы: ' + error.message });
  } finally {
    if (client) client.release();
  }
});
app.post('/api/upload-schedule', upload.single('excelFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    console.log('Загружен файл:', req.file.originalname);
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const students = jsonData.map((row, index) => {
      const name = row['name'] || row['Name'] || row['ФИО'] || row['ФИО студента'] || row['Студент'] || 'Неизвестный';
      const group = row['group'] || row['Group'] || row['Группа'] || 'Неизвестная группа';
      const nameParts = name.split(' ').filter(part => part.trim() !== '');
      let surname = '', firstName = '', patronymic = '';
      if (nameParts.length >= 3) {surname = nameParts[0] || ''; firstName = nameParts[1] || ''; patronymic = nameParts.slice(2).join(' ') || '';} 
      else if (nameParts.length === 2) {surname = nameParts[0] || ''; firstName = nameParts[1] || '';} 
      else if (nameParts.length === 1) {surname = nameParts[0] || ''; firstName = name;}
      return {name: firstName, surname: surname, patronymic: patronymic, group: group, fullName: name, rowIndex: index + 2};
    }).filter(student => student.surname && student.name);
    const uniqueGroups = [...new Set(students.map(s => s.group))];
    res.json({success: true, students: students, groups: uniqueGroups, totalRows: jsonData.length, processedRows: students.length, message: `Найдено ${students.length} студентов в ${uniqueGroups.length} группах`});
  } catch (error) {
    console.error('Ошибка парсинга Excel:', error);
    res.status(500).json({ error: 'Ошибка обработки файла: ' + error.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  let client;
  try {
    const { date, subject, group, presentStudents, absentStudents, presentCount, totalCount } = req.body;
    console.log('Сохранение посещаемости в базу...');
    client = await pool.connect();
    const tableExists = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance')`);
    if (!tableExists.rows[0].exists) {
      await client.query(`CREATE TABLE attendance ("Id" SERIAL PRIMARY KEY, "Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "Subject" TEXT, "GroupName" TEXT, "PresentStudents" JSONB, "AbsentStudents" JSONB, "PresentCount" INTEGER, "TotalCount" INTEGER, "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    }
    const result = await client.query(`INSERT INTO attendance ("Date", "Subject", "GroupName", "PresentStudents", "AbsentStudents", "PresentCount", "TotalCount") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "Id"`, [date || new Date().toISOString(), subject || 'Неизвестный предмет', group || 'Неизвестная группа', JSON.stringify(presentStudents || []), JSON.stringify(absentStudents || []), presentCount || 0, totalCount || 0]);
    res.json({success: true, message: `Посещаемость сохранена: ${presentCount} из ${totalCount} студентов`, id: result.rows[0].Id});
  } catch (error) {
    console.error('Ошибка сохранения посещаемости:', error);
    res.status(500).json({ error: 'Ошибка сохранения посещаемости' });
  } finally {
    if (client) client.release();
  }
});

app.get('/', (req, res) => {res.sendFile(path.join(__dirname, 'form.html'));});
app.get('/index.html', (req, res) => {res.sendFile(path.join(__dirname, 'index.html'));});
app.get('/admin-dashboard.html', (req, res) => {res.sendFile(path.join(__dirname, 'admin-dashboard.html'));});
app.get('/form.html', (req, res) => {res.sendFile(path.join(__dirname, 'form.html'));});
app.get('*', (req, res) => {res.redirect('/');});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`Node.js сервер запущен на http://localhost:${PORT}`);
  console.log('ПОДКЛЮЧЕНИЕ К POSTGRESQL: АКТИВНО');
  console.log('='.repeat(60));
  console.log('ДОСТУПНЫЕ API:');
  console.log(`GET  /api/students - Все студенты`);
  console.log(`GET  /api/groups - Все группы`);
  console.log(`GET  /api/instructors - Все преподаватели`);
  console.log(`GET  /api/departments - Все кафедры`);
  console.log(`GET  /api/subjects - Все предметы`);
  console.log(`GET  /api/assignments - Все назначения`);
  console.log(`POST /api/assignments - Создать назначение`);
  console.log(`POST /api/students - Создать студента`);
  console.log(`POST /api/upload-schedule - Загрузить Excel`);
  console.log('='.repeat(60));
});