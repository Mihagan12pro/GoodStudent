import express from 'express';
import cors from 'cors';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import iconv from 'iconv-lite';
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
  max: 20,
  client_encoding: 'WIN1251'
};
const pools = {
  students: new Pool({ ...poolConfig, database: 'goodStudent_studentsDb' }),
  instructors: new Pool({ ...poolConfig, database: 'goodStudent_instructorsDb' }),
  events: new Pool({ ...poolConfig, database: 'goodStudents_eventsDb' }),
  sections: new Pool({ ...poolConfig, database: 'goodStudents_sectionsDb' })
};
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
    client = await pools.students.connect();
    const result = await client.query(`SELECT s."Id", s."name", s."surname", s."patronymic", s."GroupId", s."status", g."number" as "group_number" FROM students s LEFT JOIN groups g ON s."GroupId" = g."Id" ORDER BY s."surname", s."name" LIMIT 100`);
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
app.put('/api/students/:id', async (req, res) => {
  let client;
  try {
    const studentId = req.params.id;
    const { name, surname, patronymic, groupId, status } = req.body;    
    console.log('Обновление студента:', studentId, { name, surname, groupId, status });    
    client = await pools.students.connect();    
    const result = await client.query(
      `UPDATE students SET "name" = $1, "surname" = $2, "patronymic" = $3, "GroupId" = $4, "status" = $5 
      WHERE "Id" = $6 RETURNING "Id"`,
      [name, surname, patronymic || '', groupId, status || 0, studentId]
    );    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Студент не найден' });
    }    
    res.json({ success: true, id: studentId });
  } catch (error) {
    console.error('Ошибка обновления студента:', error);
    res.status(500).json({ error: 'Ошибка обновления студента: ' + error.message });
  } finally {
    if (client) client.release();
  }
});
app.delete('/api/students/:id', async (req, res) => {
  let client;
  try {
    const studentId = req.params.id;    
    console.log('Удаление студента:', studentId);    
    client = await pools.students.connect();    
    const result = await client.query('DELETE FROM students WHERE "Id" = $1 RETURNING "Id"', [studentId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Студент не найден' });
    }    
    res.json({ success: true, message: 'Студент удален' });
  } catch (error) {
    console.error('Ошибка удаления студента:', error);
    res.status(500).json({ error: 'Ошибка удаления студента: ' + error.message });
  } finally {
    if (client) client.release();
  }
});
app.post('/api/students', async (req, res) => {
  let client;
  try {
    const { name, surname, patronymic, groupId, status } = req.body;
    console.log('Создание студента:', { name, surname, groupId });
    client = await pools.students.connect();
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
app.get('/api/groups', async (req, res) => {
  let client;
  try {
    client = await pools.students.connect();
    const result = await client.query(`SELECT "Id", "number", "profession_id" FROM groups ORDER BY "number" LIMIT 50`);
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
app.put('/api/groups/:id', async (req, res) => {
  let client;
  try {
    const groupId = req.params.id;
    const { number } = req.body;   
    console.log('Обновление группы:', groupId, { number });    
    client = await pools.students.connect();
    const checkQuery = 'SELECT "Id" FROM groups WHERE "number" = $1 AND "Id" != $2';
    const checkResult = await client.query(checkQuery, [number, groupId]);    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: 'Группа с таким номером уже существует' });
    }    
    const result = await client.query(
      `UPDATE groups SET "number" = $1 WHERE "Id" = $2 RETURNING "Id"`,
      [number, groupId]
    );    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }    
    res.json({ success: true, id: groupId });
  } catch (error) {
    console.error('Ошибка обновления группы:', error);
    res.status(500).json({ error: 'Ошибка обновления группы: ' + error.message });
  } finally {
    if (client) client.release();
  }
});
app.post('/api/groups', async (req, res) => {
  let client;
  try {
    const { number } = req.body;
    console.log('Создание группы:', { number });    
    client = await pools.students.connect();    
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
app.get('/api/instructors', async (req, res) => {
  let client;
  try {
    client = await pools.instructors.connect();
    const result = await client.query(`SELECT "Id", "name", "surname", "patronymic", "DepartmentId" FROM "Instructors" ORDER BY "surname", "name"`);    
    console.log('ДАННЫЕ ИЗ БАЗЫ ПРЕПОДАВАТЕЛЕЙ:', result.rows);
    const fixEncoding = (text) => {
      if (!text) return text;
      try {
        return text
          .replace(/Љ/g, 'К')
          .replace(/дҐ¤а/g, 'афедра')
          .replace(/Ёд®а¬/g, 'информ')
          .replace(/вҐе®«®Ј/g, 'технолог')
          .replace(/Їа®Ја/g, 'прогр')
          .replace(/¬/g, 'м')
          .replace(/Ґ/g, 'е')
          .replace(/®/g, 'о')
          .replace(/Є/g, 'к');
      } catch (e) {
        return text;
      }
    };
    const instructors = result.rows.map(row => ({
      id: row.Id,
      name: fixEncoding(row.name),
      surname: fixEncoding(row.surname),
      patronymic: fixEncoding(row.patronymic),
      departmentId: row.DepartmentId
    }));    
    console.log('ПРЕПОДАВАТЕЛИ ПОСЛЕ ИСПРАВЛЕНИЯ:', instructors);
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
    client = await pools.sections.connect();
    const result = await client.query(`SELECT "Id", "Tittle", "Description", "FacultyId" FROM "Departments" ORDER BY "Tittle"`);
    const departments = result.rows.map(row => ({
      id: row.Id,
      tittle: row.Tittle,
      description: row.Description,
      facultyId: row.FacultyId
    }));
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
    client = await pools.events.connect();
    const result = await client.query(`SELECT "Id", "Tittle", "Description", "DepartmentId" FROM "Subjects" ORDER BY "Tittle"`);
    const subjects = result.rows.map(row => ({
      id: row.Id,
      name: row.Tittle,
      description: row.Description,
      departmentId: row.DepartmentId
    }));
    res.json(subjects);
  } catch (error) {
    console.error('Ошибка загрузки предметов:', error);
    res.status(500).json({ error: 'Ошибка загрузки предметов' });
  } finally {
    if (client) client.release();
  }
});
app.get('/api/faculties-full', async (req, res) => {
  let client;
  try {
    client = await pools.sections.connect();
    const result = await client.query('SELECT "Id", "Tittle", "Description" FROM "Faculties" ORDER BY "Tittle"');
    const faculties = result.rows.map(row => ({
      id: row.Id,
      tittle: row.Tittle,
      description: row.Description
    }));
    res.json(faculties);
  } catch (error) {
    console.error('Ошибка загрузки факультетов:', error);
    res.status(500).json({ error: 'Ошибка загрузки факультетов' });
  } finally {
    if (client) client.release();
  }
});
app.get('/api/assignments', async (req, res) => {
  let client;
  try {
    client = await pools.students.connect();
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'instructor_assignments'
      )
    `);    
    if (!tableExists.rows[0].exists) {
      console.log('Создаем таблицу instructor_assignments...');
      await client.query(`
        CREATE TABLE instructor_assignments (
          "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "instructor_id" UUID,
          "subject_id" UUID, 
          "group_id" UUID,
          "department_id" UUID,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`
        INSERT INTO instructor_assignments ("instructor_id", "subject_id", "group_id", "department_id") VALUES
        ('11111111-1111-1111-1111-111111111111', '1', 'b8f78604-7d47-4eb0-9389-6b8eaaa1653b', '1'),
        ('22222222-2222-2222-2222-222222222222', '2', '137b8ecb-402d-41fe-979d-3bb5fd02e7c2', '2')
      `);
    }   
    const result = await client.query(`
      SELECT * FROM instructor_assignments 
      ORDER BY "created_at" DESC
    `);    
    const assignments = result.rows.map(row => ({
      id: row.Id, 
      instructor_id: row.instructor_id,
      subject_id: row.subject_id,
      group_id: row.group_id,
      department_id: row.department_id,
      created_at: row.created_at
    }));    
    console.log('Назначения загружены:', assignments.length);
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
    client = await pools.students.connect();
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
app.delete('/api/assignments/:id', async (req, res) => {
  let client;
  try {
    const assignmentId = req.params.id;
    client = await pools.students.connect();
    await client.query('DELETE FROM instructor_assignments WHERE "Id" = $1', [assignmentId]);
    res.json({ success: true, message: 'Назначение удалено' });
  } catch (error) {
    console.error('Ошибка удаления назначения:', error);
    res.status(500).json({ error: 'Ошибка удаления назначения' });
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
      if (nameParts.length >= 3) {
        surname = nameParts[0] || ''; 
        firstName = nameParts[1] || ''; 
        patronymic = nameParts.slice(2).join(' ') || '';
      } else if (nameParts.length === 2) {
        surname = nameParts[0] || ''; 
        firstName = nameParts[1] || '';
      } else if (nameParts.length === 1) {
        surname = nameParts[0] || ''; 
        firstName = name;
      }      
      return {
        name: firstName, 
        surname: surname, 
        patronymic: patronymic, 
        group: group, 
        fullName: name, 
        rowIndex: index + 2
      };
    }).filter(student => student.surname && student.name);    
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
app.post('/api/attendance', async (req, res) => {
  let client;
  try {
    const { date, subject, group, presentStudents, absentStudents, presentCount, totalCount } = req.body;
    console.log('Сохранение посещаемости в базу...');
    client = await pools.students.connect();
    const tableExists = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance')`);    
    if (!tableExists.rows[0].exists) {
      await client.query(`CREATE TABLE attendance ("Id" SERIAL PRIMARY KEY, "Date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "Subject" TEXT, "GroupName" TEXT, "PresentStudents" JSONB, "AbsentStudents" JSONB, "PresentCount" INTEGER, "TotalCount" INTEGER, "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    }    
    const result = await client.query(`INSERT INTO attendance ("Date", "Subject", "GroupName", "PresentStudents", "AbsentStudents", "PresentCount", "TotalCount") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "Id"`, [
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
app.post('/api/schedule-details', async (req, res) => {
  let client;
  try {
    const { assignment_id, classroom, assignment_date, start_time, end_time } = req.body;    
    client = await pools.students.connect();
    const scheduleId = generateUUID();    
    const result = await client.query(
      `INSERT INTO schedule_details 
      ("id", "assignment_id", "classroom", "assignment_date", "start_time", "end_time") 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING "id"`, 
      [scheduleId, assignment_id, classroom, assignment_date, start_time, end_time]
    );    
    res.json({ id: scheduleId, success: true });
  } catch (error) {
    console.error('Ошибка создания расписания:', error);
    res.status(500).json({ error: 'Ошибка создания расписания: ' + error.message });
  } finally {
    if (client) client.release();
  }
});
app.get('/api/schedule-details/:assignmentId', async (req, res) => {
  let client;
  try {
    const { assignmentId } = req.params;    
    client = await pools.students.connect();
    const result = await client.query(
      `SELECT * FROM schedule_details WHERE "assignment_id" = $1 ORDER BY "created_at" DESC`,
      [assignmentId]
    );    
    const scheduleDetails = result.rows.map(row => ({
      id: row.id,
      assignment_id: row.assignment_id,
      classroom: row.classroom,
      assignment_date: row.assignment_date,
      start_time: row.start_time,
      end_time: row.end_time,
      created_at: row.created_at
    }));    
    res.json(scheduleDetails);
  } catch (error) {
    console.error('Ошибка загрузки расписания:', error);
    res.status(500).json({ error: 'Ошибка загрузки расписания' });
  } finally {
    if (client) client.release();
  }
});
app.get('/api/schedule-details', async (req, res) => {
  let client;
  try {
    client = await pools.students.connect();
    const result = await client.query(
      `SELECT * FROM schedule_details ORDER BY "created_at" DESC`
    );    
    const scheduleDetails = result.rows.map(row => ({
      id: row.id,
      assignment_id: row.assignment_id,
      classroom: row.classroom,
      assignment_date: row.assignment_date,
      start_time: row.start_time,
      end_time: row.end_time,
      created_at: row.created_at
    }));    
    res.json(scheduleDetails);
  } catch (error) {
    console.error('Ошибка загрузки расписания:', error);
    res.status(500).json({ error: 'Ошибка загрузки расписания' });
  } finally {
    if (client) client.release();
  }
});
app.get('/api/instructors/:id/assignments', async (req, res) => {
  let client;
  try {
    const instructorId = req.params.id;
    console.log('=== ОТЛАДКА НАЗНАЧЕНИЙ ===');
    console.log('ID преподавателя:', instructorId);
    client = await pools.students.connect();
    
    // ПРОБУЕМ РАЗНЫЕ ВАРИАНТЫ ТАБЛИЦ ДЛЯ ПРЕДМЕТОВ
    let subjectsMap = {};
    
    try {
      // Вариант 1: Пробуем таблицу Subjects
      const subjectsResult = await client.query(`
        SELECT "Id", "Tittle" as name FROM "Subjects" 
        WHERE "Id" IN (
          SELECT DISTINCT subject_id FROM instructor_assignments WHERE instructor_id = $1
        )
      `, [instructorId]);
      
      subjectsResult.rows.forEach(subject => {
        subjectsMap[subject.Id] = subject.name;
      });
      console.log('Загружено предметов из Subjects:', subjectsResult.rows.length);
      
    } catch (subjectsError) {
      console.log('Таблица Subjects недоступна, пробуем Professions...');
      
      try {
        // Вариант 2: Пробуем таблицу Professions
        const professionsResult = await client.query(`
          SELECT "Id", "Tittle" as name FROM "Professions" 
          WHERE "Id" IN (
            SELECT DISTINCT subject_id FROM instructor_assignments WHERE instructor_id = $1
          )
        `, [instructorId]);
        
        professionsResult.rows.forEach(subject => {
          subjectsMap[subject.Id] = subject.name;
        });
        console.log('Загружено предметов из Professions:', professionsResult.rows.length);
        
      } catch (professionsError) {
        console.log('Таблица Professions также недоступна, используем fallback названия');
        // Используем fallback названия
        subjectsMap = {
          'cb88af9f-eae8-4533-ba74-507c04b3ed71': 'Системы инженерного анализа',
          '0be47cae-ee85-40df-885b-213cfce7532c': 'Базы данных',
          'df91f611-94f9-4c4f-923e-71c29f8e3ee8': 'Веб-программирование'
        };
      }
    }
    
    // Загружаем назначения
    const result = await client.query(`
      SELECT 
        ia.*,
        sd.classroom,
        sd.assignment_date,
        sd.start_time,
        sd.end_time,
        g."number" as group_number
      FROM instructor_assignments ia
      LEFT JOIN schedule_details sd ON ia."Id" = sd.assignment_id
      LEFT JOIN groups g ON ia.group_id::text = g."Id"::text
      WHERE ia.instructor_id = $1
      ORDER BY sd.assignment_date, sd.start_time
    `, [instructorId]);
    
    console.log('Результат запроса назначений:', result.rows.length);
    
    const assignments = result.rows.map(row => {
      const subjectName = subjectsMap[row.subject_id] || `Предмет ${row.subject_id?.substring(0, 8)}...`;
      
      return {
        id: row.Id,
        subject_id: row.subject_id,
        subject_name: subjectName,
        group_id: row.group_id,
        group_number: row.group_number,
        department_id: row.department_id,
        classroom: row.classroom,
        assignment_date: row.assignment_date,
        start_time: row.start_time,
        end_time: row.end_time,
        created_at: row.created_at
      };
    });
    
    console.log('Обработанные назначения:', assignments);
    res.json(assignments);
    
  } catch (error) {
    console.error('ОШИБКА в endpoint назначений:', error);
    res.json([]);
  } finally {
    if (client) client.release();
  }
});
// getSubjectNameById(subjectId) {
//   const subjectNames = {
//     '1': 'Системы инженерного анализа',
//     '2': 'Базы данных', 
//     '3': 'Веб-программирование',
//     '4': 'Математический анализ',
//     '5': 'Нормативное регулирование'
//   };
//   return subjectNames[subjectId] || `Предмет ${subjectId}`;
// }
app.get('/api/csharp/subjects', async (req, res) => {
    let client;
    try {
        console.log('=== ЗАГРУЗКА PROFESSIONS КАК SUBJECTS ===');
        client = await pools.sections.connect();        
        const result = await client.query(`
            SELECT "Id", "Tittle", "Code", "Profile", "DepartmentId" 
            FROM "Professions" 
            ORDER BY "Tittle"
        `);        
        console.log('Найдено Professions в базе:', result.rows.length);        
        const subjects = result.rows.map(row => ({
            id: row.Id,
            name: row.Tittle,  
            description: row.Profile, 
            departmentId: row.DepartmentId
        }));        
        console.log('Преобразовано в Subjects:', subjects);
        res.json(subjects);
        
    } catch (error) {
        console.error('Ошибка загрузки Professions:', error);
        res.json([]);
    } finally {
        if (client) client.release();
    }
});
// app.get('/api/csharp/subjects', async (req, res) => {
//     try {
//         const response = await fetch('https://localhost:7298/api/sections/Subjects', {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json', 
//                 'Content-Type': 'application/json'
//             }
//         });        
//         if (response.ok) {
//             const subjects = await response.json();
//             console.log('Предметы из C#:', subjects.length);
//             res.json(subjects);
//         } else {
//             console.log('C# Subjects недоступен (статус:', response.status, ')');
//             res.json([]);
//         }
//     } catch (error) {
//         console.log('C# Subjects: ошибка подключения');
//         res.json([]);
//     }
// });////////
app.get('/api/csharp/departments', async (req, res) => {
    let client;
    try {
        console.log('Загрузка кафедр напрямую из базы...');
        client = await pools.sections.connect();
        
        const result = await client.query(`
            SELECT "Id", "Tittle", "Description", "FacultyId" 
            FROM "Departments" 
            ORDER BY "Tittle"
        `);       
        const departments = result.rows.map(row => ({
            id: row.Id,
            tittle: row.Tittle,
            description: row.Description,
            facultyId: row.FacultyId
        }));        
        console.log('Загружено кафедр:', departments.length);
        res.json(departments);
        
    } catch (error) {
        console.error('Ошибка загрузки кафедр:', error);
        res.status(500).json({ error: 'Ошибка загрузки кафедр' });
    } finally {
        if (client) client.release();
    }
});
app.get('/api/csharp/faculties', async (req, res) => {
    let client;
    try {
        console.log('Загрузка факультетов напрямую из базы...');
        client = await pools.sections.connect();
        
        const result = await client.query(`
            SELECT "Id", "Tittle", "Description" 
            FROM "Faculties" 
            ORDER BY "Tittle"
        `);        
        const faculties = result.rows.map(row => ({
            id: row.Id,
            tittle: row.Tittle,
            description: row.Description
        }));        
        console.log('Загружено факультетов:', faculties.length);
        res.json(faculties);
        
    } catch (error) {
        console.error('Ошибка загрузки факультетов:', error);
        res.status(500).json({ error: 'Ошибка загрузки факультетов' });
    } finally {
        if (client) client.release();
    }
});
// app.get('/api/csharp/departments', async (req, res) => {
//     try {
//         const response = await fetch('https://localhost:7298/api/sections/Departments', {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             }
//         });        
//         if (response.ok) {
//             const departments = await response.json();
//             console.log('Кафедры из C#:', departments.length);
//             res.json(departments);
//         } else {
//             console.log('C# Departments недоступен (статус:', response.status, ')');
//             res.json([]); 
//         }
//     } catch (error) {
//         console.log('C# Departments: ошибка подключения');
//         res.json([]); 
//     }
// });
// app.get('/api/csharp/faculties', async (req, res) => {
//     try {
//         const response = await fetch('https://localhost:7298/api/sections/Faculty', {
//             method: 'GET', 
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             }
//         });        
//         if (response.ok) {
//             const faculties = await response.json();
//             console.log('Факультеты из C#:', faculties.length);
//             res.json(faculties);
//         } else {
//             console.log('C# Faculties недоступен (статус:', response.status, ')');
//             res.json([]);
//         }
//     } catch (error) {
//         console.log('C# Faculties: ошибка подключения');
//         res.json([]);
//     }
// });
app.get('/api/csharp/professions', async (req, res) => {
    try {
        const response = await fetch('https://localhost:7298/api/sections/Professions');
        if (response.ok) {
            const professions = await response.json();
            res.json(professions);
        } else {
            throw new Error('C# API error');
        }
    } catch (error) {
        console.error('Ошибка загрузки специальностей:', error);
        res.status(500).json({ error: 'Ошибка загрузки специальностей' });
    }
});
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'form.html')); });
app.get('/index.html', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/admin-dashboard.html', (req, res) => { res.sendFile(path.join(__dirname, 'admin-dashboard.html')); });
app.get('/form.html', (req, res) => { res.sendFile(path.join(__dirname, 'form.html')); });
app.get('*', (req, res) => { res.redirect('/'); });
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