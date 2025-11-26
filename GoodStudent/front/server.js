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

// Вспомогательная функция для генерации UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Получение всех студентов
app.get('/api/students', async (req, res) => {
  console.log('Запрос студентов');
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        s."Id",
        s."name",
        s."surname", 
        s."patronymic",
        s."GroupId",
        s."status",
        g."number" as "group_number"
      FROM students s
      LEFT JOIN groups g ON s."GroupId" = g."Id"
      ORDER BY s."surname", s."name"
      LIMIT 100
    `);    
    
    console.log(`Найдено студентов: ${result.rows.length}`);    
    
    const students = result.rows.map(student => ({
      id: student.Id,
      name: student.name,
      surname: student.surname,
      patronymic: student.patronymic,
      groupId: student.GroupId,
      groupName: student.group_number || 'Не указана', 
      status: student.status
    }));
    
    res.json(students);    
    
  } catch (error) {
    console.error('Ошибка загрузки студентов:', error);
    res.status(500).json({ error: 'Ошибка загрузки студентов' });
  } finally {
    if (client) client.release();
  }
});

// Получение всех групп
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
    res.status(500).json({ error: 'Ошибка загрузки групп' });
  } finally {
    if (client) client.release();
  }
});

// Создание студента через C# бэкенд
app.post('/api/students', async (req, res) => {
  try {
    const { name, surname, patronymic, groupId, status, startYear } = req.body;
    console.log('Создание студента через C# бэкенд:', { name, surname, groupId });
    
    // Отправляем запрос к C# бэкенду
    const csharpResponse = await fetch('https://localhost:7298/api/Students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        surname: surname,
        patronymic: patronymic || '',
        startYear: startYear || 2024,
        groupId: groupId,
        status: status || 0
      })
    });
    
    if (!csharpResponse.ok) {
      const errorText = await csharpResponse.text();
      throw new Error(`C# API error: ${csharpResponse.status} - ${errorText}`);
    }
    
    const result = await csharpResponse.json();
    
    res.json({ 
      id: result,
      success: true 
    });    
    
  } catch (error) {
    console.error('Ошибка создания студента через C#:', error);
    
    // Fallback: создаем через прямую запись в PostgreSQL
    let client;
    try {
      client = await pool.connect();
      
      // Проверим, существует ли студент с таким именем и группой
      const checkQuery = `
        SELECT "Id" FROM students 
        WHERE "name" = $1 AND "surname" = $2 AND "GroupId" = $3
      `;
      const checkResult = await client.query(checkQuery, [name, surname, groupId]);
      
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Студент с таким именем уже существует в этой группе',
          existingId: checkResult.rows[0].Id
        });
      }
      
      const query = `
        INSERT INTO students ("Id", "name", "surname", "patronymic", "GroupId", "status")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING "Id"
      `;    
      
      const studentId = generateUUID();
      const result = await client.query(query, [
        studentId,
        name, 
        surname, 
        patronymic || '', 
        groupId, 
        status || 0
      ]);    
      
      res.json({ 
        id: studentId,
        success: true 
      });    
      
    } catch (fallbackError) {
      console.error('Ошибка создания студента (fallback):', fallbackError);
      res.status(500).json({ error: 'Ошибка создания студента: ' + fallbackError.message });
    } finally {
      if (client) client.release();
    }
  }
});

// Создание группы через C# бэкенд
app.post('/api/groups', async (req, res) => {
  try {
    const { number, professionId } = req.body;
    console.log('Создание группы через C# бэкенд:', { number, professionId });
    
    // Сначала проверяем существование группы в нашей базе
    let client = await pool.connect();
    const checkQuery = 'SELECT "Id" FROM groups WHERE "number" = $1';
    const checkResult = await client.query(checkQuery, [number]);
    
    if (checkResult.rows.length > 0) {
      client.release();
      return res.json({ 
        id: checkResult.rows[0].Id,
        exists: true 
      });
    }
    client.release();
    
    // Отправляем запрос к C# бэкенду
    const csharpResponse = await fetch('https://localhost:7298/api/Groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        number: number,
        professionId: professionId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      })
    });
    
    if (!csharpResponse.ok) {
      const errorText = await csharpResponse.text();
      throw new Error(`C# API error: ${csharpResponse.status} - ${errorText}`);
    }
    
    const result = await csharpResponse.json();
    
    res.json({ 
      id: result,
      success: true 
    });    
    
  } catch (error) {
    console.error('Ошибка создания группы через C#:', error);
    
    // Fallback: создаем через прямую запись в PostgreSQL
    let client;
    try {
      client = await pool.connect();
      
      const query = `
        INSERT INTO groups ("Id", "number", "profession_id")
        VALUES ($1, $2, $3)
        RETURNING "Id"
      `;    
      
      const groupId = generateUUID();
      const result = await client.query(query, [
        groupId,
        number, 
        professionId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"
      ]);   
      
      res.json({ 
        id: groupId,
        success: true 
      });    
      
    } catch (fallbackError) {
      console.error('Ошибка создания группы (fallback):', fallbackError);
      res.status(500).json({ error: 'Ошибка создания группы: ' + fallbackError.message });
    } finally {
      if (client) client.release();
    }
  }
});

// Загрузка Excel файла
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
    
    const students = jsonData.map((row, index) => {
      // Парсим ФИО из разных возможных форматов
      const name = row['name'] || row['Name'] || row['ФИО'] || row['ФИО студента'] || row['Студент'] || 'Неизвестный';
      const group = row['group'] || row['Group'] || row['Группа'] || 'Неизвестная группа';
      
      // Разбираем ФИО на составляющие
      const nameParts = name.split(' ').filter(part => part.trim() !== '');
      
      let surname = '', firstName = '', patronymic = '';
      
      if (nameParts.length >= 3) {
        // Формат: Фамилия Имя Отчество
        surname = nameParts[0] || '';
        firstName = nameParts[1] || '';
        patronymic = nameParts.slice(2).join(' ') || '';
      } else if (nameParts.length === 2) {
        // Формат: Фамилия Имя
        surname = nameParts[0] || '';
        firstName = nameParts[1] || '';
      } else if (nameParts.length === 1) {
        // Только фамилия
        surname = nameParts[0] || '';
        firstName = name;
      }
      
      return {
        name: firstName,
        surname: surname,
        patronymic: patronymic,
        group: group,
        fullName: name,
        rowIndex: index + 2 // +2 потому что Excel начинается с 1 и заголовок
      };
    }).filter(student => student.surname && student.name); // Фильтруем пустые записи
    
    const uniqueGroups = [...new Set(students.map(s => s.group))];    
    
    res.json({
      success: true,
      students: students,
      groups: uniqueGroups,
      totalRows: jsonData.length,
      processedRows: students.length,
      message: `Найдено ${students.length} студентов в ${uniqueGroups.length} группах`
    });    
    
  } catch (error) {
    console.error('Ошибка парсинга Excel:', error);
    res.status(500).json({ error: 'Ошибка обработки файла: ' + error.message });
  }
});

// Создание таблицы attendance если её нет
app.post('/api/init-attendance', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      await client.query(`
        CREATE TABLE attendance (
          "Id" SERIAL PRIMARY KEY,
          "Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "Subject" TEXT,
          "GroupName" TEXT,
          "PresentStudents" JSONB,
          "AbsentStudents" JSONB,
          "PresentCount" INTEGER,
          "TotalCount" INTEGER,
          "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Таблица attendance создана');
    }
    
    res.json({ success: true, message: 'Таблица attendance готова' });
    
  } catch (error) {
    console.error('Ошибка инициализации attendance:', error);
    res.status(500).json({ error: 'Ошибка инициализации' });
  } finally {
    if (client) client.release();
  }
});

// Сохранение посещаемости
app.post('/api/attendance', async (req, res) => {
  let client;
  try {
    const { date, subject, group, presentStudents, absentStudents, presentCount, totalCount } = req.body;
    console.log('Сохранение посещаемости в базу...');
    
    client = await pool.connect();    
    
    // Проверим существование таблицы attendance
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'attendance'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      // Создадим таблицу если её нет
      await client.query(`
        CREATE TABLE attendance (
          "Id" SERIAL PRIMARY KEY,
          "Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "Subject" TEXT,
          "GroupName" TEXT,
          "PresentStudents" JSONB,
          "AbsentStudents" JSONB,
          "PresentCount" INTEGER,
          "TotalCount" INTEGER,
          "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
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

// Получение истории посещаемости
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

// Получение студентов по группе
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
    res.status(500).json({ error: 'Ошибка загрузки студентов группы' });
  } finally {
    if (client) client.release();
  }
});

// Получение предметов
app.get('/api/subjects', async (req, res) => {
  try {
    console.log('Запрос предметов...');
    res.json([
      { id: 1, name: 'Системы инженерного анализа', type: 'Лаб. работа' },
      { id: 2, name: 'Нормативное регулирование', type: 'Лекция' },
      { id: 3, name: 'Базы данных', type: 'Практика' },
      { id: 4, name: 'Веб-программирование', type: 'Лаб. работа' },
      { id: 5, name: 'Математика', type: 'Лекция' },
      { id: 6, name: 'Программирование', type: 'Лаб. работа' }
    ]);
  } catch (error) {
    console.error('Ошибка загрузки предметов:', error);
    res.status(500).json({ error: 'Ошибка загрузки предметов' });
  }
});

// Получение преподавателей
app.get('/api/instructors', async (req, res) => {
  try {
    console.log('Запрос преподавателей...');
    res.json([
      { id: '1', name: 'Петр', surname: 'Иванов', patronymic: 'Сергеевич', departmentId: '1' },
      { id: '2', name: 'Мария', surname: 'Петрова', patronymic: 'Ивановна', departmentId: '1' },
      { id: '3', name: 'Алексей', surname: 'Сидоров', patronymic: 'Владимирович', departmentId: '2' },
      { id: '4', name: 'Ольга', surname: 'Макарова', patronymic: 'Сергеевна', departmentId: '2' }
    ]);
  } catch (error) {
    console.error('Ошибка загрузки преподавателей:', error);
    res.status(500).json({ error: 'Ошибка загрузки преподавателей' });
  }
});

// Получение кафедр
app.get('/api/departments', async (req, res) => {
  try {
    console.log('Запрос кафедр...');
    res.json([
      { id: '1', tittle: 'Информационные системы', description: 'Кафедра информационных систем' },
      { id: '2', tittle: 'Программная инженерия', description: 'Кафедра программной инженерии' },
      { id: '3', tittle: 'Компьютерная безопасность', description: 'Кафедра компьютерной безопасности' }
    ]);
  } catch (error) {
    console.error('Ошибка загрузки кафедр:', error);
    res.status(500).json({ error: 'Ошибка загрузки кафедр' });
  }
});

// Отладочный endpoint для очистки базы
app.delete('/api/debug/clear-students', async (req, res) => {
  let client;
  try {
    client = await pool.connect();    
    console.log('Очистка таблицы студентов...');
    
    await client.query('DELETE FROM students');
    console.log('Студенты удалены');
    
    res.json({
      success: true,
      message: 'Таблица студентов очищена'
    });
    
  } catch (error) {
    console.error('Ошибка очистки:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (client) client.release();
  }
});

// Основные маршруты
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
  console.log(`POST /api/students - Создать студента`);
  console.log(`POST /api/upload-schedule - Загрузить Excel`);
  console.log(`POST /api/attendance - Сохранить посещаемость`);
  console.log(`POST /api/init-attendance - Инициализировать таблицу посещаемости`);
  console.log('='.repeat(60));
});