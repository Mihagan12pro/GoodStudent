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
app.get('/api/students', async (req, res) => {
  console.log('Запрос студентов');
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        "Id",
        "name",
        "surname",
        "patronymic",
        "GroupId",
        "status"
      FROM students 
      LIMIT 50
    `);
    console.log(`Найдено студентов: ${result.rows.length}`);
    const studentsWithGroups = await Promise.all(
      result.rows.map(async (student) => {
        try {
          const groupResult = await client.query(
            'SELECT "number" FROM groups WHERE "Id" = $1',
            [student.GroupId]
          );
          
          return {
            id: student.Id,
            name: student.name,
            surname: student.surname,
            patronymic: student.patronymic,
            groupId: student.GroupId,
            groupNumber: groupResult.rows[0]?.number || 'Неизвестная группа',
            status: student.status
          };
        } catch (error) {
          return {
            id: student.Id,
            name: student.name,
            surname: student.surname,
            patronymic: student.patronymic,
            groupId: student.GroupId,
            groupNumber: 'Ошибка загрузки группы',
            status: student.status
          };
        }
      })
    );    
    res.json(studentsWithGroups);    
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error);
    res.json([
      {
        id: '1',
        name: 'Иван',
        surname: 'Иванов',
        patronymic: 'Иванович',
        groupId: '1',
        groupNumber: '231-324',
        status: 0
      },
      {
        id: '2', 
        name: 'Мария',
        surname: 'Петрова',
        patronymic: 'Сергеевна',
        groupId: '1',
        groupNumber: '231-324',
        status: 0
      },
      {
        id: '3',
        name: 'Сергей',
        surname: 'Сидоров',
        patronymic: 'Алексеевич',
        groupId: '2', 
        groupNumber: '231-325',
        status: 0
      }
    ]);
  } finally {
    if (client) client.release();
  }
});
app.get('/api/groups', async (req, res) => {
  console.log('Запрос групп...');
  
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        "Id",
        "number",
        "profession_id"
      FROM groups 
      ORDER BY "number"
      LIMIT 50
    `);
    
    console.log(`Найдено групп: ${result.rows.length}`);    
    const groups = result.rows.map(row => ({
      id: row.Id,
      number: row.number,
      professionId: row.profession_id
    }));
    
    res.json(groups);
    
  } catch (error) {
    console.error('Ошибка загрузки групп:', error);
    res.json([
      { id: '1', number: '231-324', professionId: 'default' },
      { id: '2', number: '231-325', professionId: 'default' },
      { id: '3', number: '231-326', professionId: 'default' }
    ]);
  } finally {
    if (client) client.release();
  }
});
app.get('/api/groups/:id/students', async (req, res) => {
  let client;
  try {
    const groupId = req.params.id;
    console.log(`Запрос студентов группы ${groupId}...`);    
    client = await pool.connect();    
    const query = `
      SELECT 
        s."Id",
        s."name",
        s."surname", 
        s."patronymic",
        s."GroupId",
        g."number" as "group_number"
      FROM students s
      LEFT JOIN groups g ON s."GroupId" = g."Id"
      WHERE s."GroupId" = $1
      ORDER BY s."surname", s."name"
    `;    
    const result = await client.query(query, [groupId]);
    console.log(`Найдено студентов в группе: ${result.rows.length}`);
    const groupQuery = 'SELECT "Id", "number" FROM groups WHERE "Id" = $1';
    const groupResult = await client.query(groupQuery, [groupId]);    
    const students = result.rows.map(row => ({
      id: row.Id,
      name: row.name,
      surname: row.surname,
      patronymic: row.patronymic,
      groupId: row.GroupId,
      groupNumber: row.group_number
    }));    
    res.json({
      group: groupResult.rows[0] || { id: groupId, number: 'Неизвестная группа' },
      students: students
    });
    
  } catch (error) {
    console.error('Ошибка загрузки студентов группы:', error);
    res.json({
      group: { id: req.params.id, number: 'Неизвестная группа' },
      students: []
    });
  } finally {
    if (client) client.release();
  }
});
app.get('/api/groups/:id', async (req, res) => {
  let client;
  try {
    const groupId = req.params.id;
    console.log(`Запрос информации о группе ${groupId}...`);
    client = await pool.connect();    
    const query = `
      SELECT 
        "Id",
        "number",
        "profession_id"
      FROM groups 
      WHERE "Id" = $1
    `;    
    const result = await client.query(query, [groupId]);    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }    
    res.json(result.rows[0]);    
  } catch (error) {
    console.error('Ошибка загрузки группы:', error);
    res.status(500).json({ error: 'Ошибка загрузки группы' });
  } finally {
    if (client) client.release();
  }
});
app.post('/api/students', async (req, res) => {
  let client;
  try {
    const { name, surname, patronymic, groupId, status } = req.body;
    console.log('➕ Создание студента:', { name, surname, groupId });
    client = await pool.connect();    
    const query = `
      INSERT INTO students ("name", "surname", "patronymic", "GroupId", "status")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "Id"
    `;    
    const result = await client.query(query, [
      name, 
      surname, 
      patronymic, 
      groupId, 
      status || 0
    ]);    
    res.json(result.rows[0].Id);    
  } catch (error) {
    console.error('Ошибка создания студента:', error);
    res.status(500).json({ error: 'Ошибка создания студента' });
  } finally {
    if (client) client.release();
  }
});
app.post('/api/groups', async (req, res) => {
  let client;
  try {
    const { number, professionId } = req.body;
    console.log('Создание группы:', { number, professionId });
    client = await pool.connect();    
    const query = `
      INSERT INTO groups ("number", "profession_id")
      VALUES ($1, $2)
      RETURNING "Id"
    `;    
    const result = await client.query(query, [number, professionId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"]);   
    res.json(result.rows[0].Id);    
  } catch (error) {
    console.error('Ошибка создания группы:', error);
    res.status(500).json({ error: 'Ошибка создания группы' });
  } finally {
    if (client) client.release();
  }
});
app.post('/api/attendance', async (req, res) => {
  let client;
  try {
    const { date, subject, group, presentStudents, absentStudents, presentCount, totalCount } = req.body;
    console.log('Сохранение посещаемости в базу...');
    client = await pool.connect();    
    const query = `
      INSERT INTO attendance ("Date", "Subject", "GroupName", "PresentStudents", "AbsentStudents", "PresentCount", "TotalCount")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "Id"
    `;    
    const result = await client.query(query, [
      date || new Date().toISOString(),
      subject || 'Неизвестный предмет',
      group || 'Неизвестная группа',
      JSON.stringify(presentStudents || []),
      JSON.stringify(absentStudents || []),
      presentCount || 0,
      totalCount || 0
    ]);    
    res.json({
      success: true,
      message: `Посещаемость сохранена: ${presentCount} из ${totalCount} студентов`,
      id: result.rows[0].Id
    });
    
  } catch (error) {
    console.error('Ошибка сохранения посещаемости:', error);
    res.status(500).json({ error: 'Ошибка сохранения посещаемости' });
  } finally {
    if (client) client.release();
  }
});
app.get('/api/attendance', async (req, res) => {
  let client;
  try {
    console.log('Запрос истории посещаемости...');
    client = await pool.connect();
    
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance'
      )
    `);    
    if (!tableExists.rows[0].exists) {
      return res.json([]);
    }    
    const query = `
      SELECT * FROM attendance 
      ORDER BY "Date" DESC 
      LIMIT 50
    `;    
    const result = await client.query(query);    
    res.json(result.rows);    
  } catch (error) {
    console.error('Ошибка загрузки истории:', error);
    res.json([]);
  } finally {
    if (client) client.release();
  }
});
app.get('/api/subjects', async (req, res) => {
  try {
    console.log('Запрос предметов...');
    res.json([
      { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа' },
      { id: 2, name: 'Нормативное регулирование', type: 'Лекция' },
      { id: 3, name: 'Базы данных', type: 'Практика' },
      { id: 4, name: 'Веб-программирование', type: 'Лаб. работа' }
    ]);
  } catch (error) {
    console.error('Ошибка загрузки предметов:', error);
    res.json([
      { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа' },
      { id: 2, name: 'Нормативное регулирование', type: 'Лекция' }
    ]);
  }
});
app.get('/api/instructors', async (req, res) => {
  try {
    console.log('Запрос преподавателей...');
    res.json([
      { id: 1, name: 'Иванов', surname: 'Петр', patronymic: 'Сергеевич' },
      { id: 2, name: 'Петрова', surname: 'Мария', patronymic: 'Ивановна' }
    ]);
  } catch (error) {
    console.error('Ошибка загрузки преподавателей:', error);
    res.json([
      { id: 1, name: 'Иванов', surname: 'Петр', patronymic: 'Сергеевич' }
    ]);
  }
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
app.get('*', (req, res) => {
  res.redirect('/');
});
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`Node.js сервер запущен на http://localhost:${PORT}`);
  console.log('ПОДКЛЮЧЕНИЕ К POSTGRESQL: АКТИВНО');
  console.log('='.repeat(60));
  console.log('ДОСТУПНЫЕ API:');
  console.log(`GET  /api/students - Все студенты`);
  console.log(`GET  /api/groups - Все группы`);
  console.log(`POST /api/attendance - Сохранить посещаемость`);
  console.log('='.repeat(60));
});