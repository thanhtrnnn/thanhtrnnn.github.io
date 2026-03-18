import * as fs from 'fs/promises';
import sql from 'mssql';
import { legacyJsonFilePath, sqlServerConfig } from '../config.js';
import { seedData } from '../data/seedData.js';

let poolPromise;
let writeQueue = Promise.resolve();

function normalizeDb(payload) {
  const src = payload || {};
  return {
    users: Array.isArray(src.users) ? src.users : [],
    exams: Array.isArray(src.exams) ? src.exams : [],
    questions: Array.isArray(src.questions) ? src.questions : [],
    results: Array.isArray(src.results) ? src.results : []
  };
}

function buildMasterConfig() {
  return {
    ...sqlServerConfig,
    database: 'master'
  };
}

async function ensureDatabaseExists() {
  const masterPool = await new sql.ConnectionPool(buildMasterConfig()).connect();
  try {
    const request = masterPool.request();
    request.input('databaseName', sql.NVarChar(128), sqlServerConfig.database);
    await request.query(`
      IF DB_ID(@databaseName) IS NULL
      BEGIN
        DECLARE @escapedName NVARCHAR(260) = REPLACE(@databaseName, ']', ']]');
        DECLARE @statement NVARCHAR(MAX) = N'CREATE DATABASE [' + @escapedName + N']';
        EXEC(@statement);
      END
    `);
  } finally {
    await masterPool.close();
  }
}

async function getPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      await ensureDatabaseExists();
      return new sql.ConnectionPool(sqlServerConfig).connect();
    })().catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

async function createSchema(pool) {
  await pool.request().query(`
    IF OBJECT_ID('dbo.users', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.users (
        id NVARCHAR(64) PRIMARY KEY,
        username NVARCHAR(128) NOT NULL UNIQUE,
        full_name NVARCHAR(255) NOT NULL,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student'))
      );
    END;

    IF OBJECT_ID('dbo.exams', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.exams (
        id NVARCHAR(64) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        type NVARCHAR(20) NOT NULL CHECK (type IN ('free', 'scheduled')),
        start_time DATETIME2 NULL,
        end_time DATETIME2 NULL,
        duration INT NOT NULL,
        status NVARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive'))
      );
    END;

    IF OBJECT_ID('dbo.questions', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.questions (
        id NVARCHAR(64) PRIMARY KEY,
        exam_id NVARCHAR(64) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        correct_option_id NVARCHAR(64) NOT NULL,
        explanation NVARCHAR(MAX) NOT NULL DEFAULT N'',
        CONSTRAINT FK_questions_exam FOREIGN KEY (exam_id) REFERENCES dbo.exams(id) ON DELETE CASCADE
      );
    END;

    IF OBJECT_ID('dbo.question_options', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.question_options (
        id INT IDENTITY(1,1) PRIMARY KEY,
        question_id NVARCHAR(64) NOT NULL,
        option_id NVARCHAR(64) NOT NULL,
        [text] NVARCHAR(MAX) NOT NULL,
        CONSTRAINT UQ_question_options UNIQUE(question_id, option_id),
        CONSTRAINT FK_question_options_question FOREIGN KEY (question_id) REFERENCES dbo.questions(id) ON DELETE CASCADE
      );
    END;

    IF OBJECT_ID('dbo.results', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.results (
        id NVARCHAR(64) PRIMARY KEY,
        student_id NVARCHAR(64) NOT NULL,
        exam_id NVARCHAR(64) NOT NULL,
        start_time DATETIME2 NOT NULL,
        submit_time DATETIME2 NOT NULL,
        correct_count INT NOT NULL,
        total_questions INT NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        status NVARCHAR(32) NOT NULL,
        CONSTRAINT FK_results_student FOREIGN KEY (student_id) REFERENCES dbo.users(id),
        CONSTRAINT FK_results_exam FOREIGN KEY (exam_id) REFERENCES dbo.exams(id) ON DELETE CASCADE
      );
    END;

    IF OBJECT_ID('dbo.result_answers', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.result_answers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        result_id NVARCHAR(64) NOT NULL,
        question_id NVARCHAR(64) NOT NULL,
        selected_option_id NVARCHAR(64) NULL,
        CONSTRAINT FK_result_answers_result FOREIGN KEY (result_id) REFERENCES dbo.results(id) ON DELETE CASCADE
      );
    END;
  `);
}

async function readLegacyJsonData() {
  try {
    const raw = await fs.readFile(legacyJsonFilePath, 'utf8');
    return normalizeDb(JSON.parse(raw));
  } catch (_error) {
    return null;
  }
}

async function insertUser(transaction, user) {
  const request = new sql.Request(transaction);
  request.input('id', sql.NVarChar(64), String(user.id));
  request.input('username', sql.NVarChar(128), String(user.username));
  request.input('fullName', sql.NVarChar(255), String(user.fullName));
  request.input('email', sql.NVarChar(255), String(user.email));
  request.input('password', sql.NVarChar(255), String(user.password));
  request.input('role', sql.NVarChar(20), String(user.role));
  await request.query(`
    INSERT INTO dbo.users (id, username, full_name, email, password, role)
    VALUES (@id, @username, @fullName, @email, @password, @role)
  `);
}

async function insertExam(transaction, exam) {
  const request = new sql.Request(transaction);
  request.input('id', sql.NVarChar(64), String(exam.id));
  request.input('title', sql.NVarChar(255), String(exam.title));
  request.input('description', sql.NVarChar(sql.MAX), String(exam.description));
  request.input('type', sql.NVarChar(20), String(exam.type));
  request.input('startTime', sql.DateTime2, exam.startTime ? new Date(exam.startTime) : null);
  request.input('endTime', sql.DateTime2, exam.endTime ? new Date(exam.endTime) : null);
  request.input('duration', sql.Int, Number(exam.duration));
  request.input('status', sql.NVarChar(20), String(exam.status));
  await request.query(`
    INSERT INTO dbo.exams (id, title, description, type, start_time, end_time, duration, status)
    VALUES (@id, @title, @description, @type, @startTime, @endTime, @duration, @status)
  `);
}

async function insertQuestion(transaction, question) {
  const request = new sql.Request(transaction);
  request.input('id', sql.NVarChar(64), String(question.id));
  request.input('examId', sql.NVarChar(64), String(question.examId));
  request.input('content', sql.NVarChar(sql.MAX), String(question.content));
  request.input('correctOptionId', sql.NVarChar(64), String(question.correctOptionId));
  request.input('explanation', sql.NVarChar(sql.MAX), String(question.explanation || ''));
  await request.query(`
    INSERT INTO dbo.questions (id, exam_id, content, correct_option_id, explanation)
    VALUES (@id, @examId, @content, @correctOptionId, @explanation)
  `);

  const options = Array.isArray(question.options) ? question.options : [];
  for (const option of options) {
    const optionRequest = new sql.Request(transaction);
    optionRequest.input('questionId', sql.NVarChar(64), String(question.id));
    optionRequest.input('optionId', sql.NVarChar(64), String(option.id));
    optionRequest.input('text', sql.NVarChar(sql.MAX), String(option.text));
    await optionRequest.query(`
      INSERT INTO dbo.question_options (question_id, option_id, [text])
      VALUES (@questionId, @optionId, @text)
    `);
  }
}

async function insertResult(transaction, result) {
  const request = new sql.Request(transaction);
  request.input('id', sql.NVarChar(64), String(result.id));
  request.input('studentId', sql.NVarChar(64), String(result.studentId));
  request.input('examId', sql.NVarChar(64), String(result.examId));
  request.input('startTime', sql.DateTime2, new Date(result.startTime));
  request.input('submitTime', sql.DateTime2, new Date(result.submitTime));
  request.input('correctCount', sql.Int, Number(result.correctCount || 0));
  request.input('totalQuestions', sql.Int, Number(result.totalQuestions || 0));
  request.input('score', sql.Decimal(5, 2), Number(result.score || 0));
  request.input('status', sql.NVarChar(32), String(result.status || 'completed'));
  await request.query(`
    INSERT INTO dbo.results (id, student_id, exam_id, start_time, submit_time, correct_count, total_questions, score, status)
    VALUES (@id, @studentId, @examId, @startTime, @submitTime, @correctCount, @totalQuestions, @score, @status)
  `);

  const answers = Array.isArray(result.answers) ? result.answers : [];
  for (const answer of answers) {
    const answerRequest = new sql.Request(transaction);
    answerRequest.input('resultId', sql.NVarChar(64), String(result.id));
    answerRequest.input('questionId', sql.NVarChar(64), String(answer.questionId));
    answerRequest.input('selectedOptionId', sql.NVarChar(64), answer.selectedOptionId || null);
    await answerRequest.query(`
      INSERT INTO dbo.result_answers (result_id, question_id, selected_option_id)
      VALUES (@resultId, @questionId, @selectedOptionId)
    `);
  }
}

async function replaceDbData(pool, payload) {
  const normalized = normalizeDb(payload);
  const transaction = new sql.Transaction(pool);

  await transaction.begin();
  try {
    await new sql.Request(transaction).query(`
      DELETE FROM dbo.result_answers;
      DELETE FROM dbo.results;
      DELETE FROM dbo.question_options;
      DELETE FROM dbo.questions;
      DELETE FROM dbo.exams;
      DELETE FROM dbo.users;
    `);

    for (const user of normalized.users) {
      await insertUser(transaction, user);
    }

    for (const exam of normalized.exams) {
      await insertExam(transaction, exam);
    }

    for (const question of normalized.questions) {
      await insertQuestion(transaction, question);
    }

    for (const result of normalized.results) {
      await insertResult(transaction, result);
    }

    await transaction.commit();
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (_rollbackError) {
      // Ignore rollback errors to preserve original failure context.
    }
    throw error;
  }

  return normalized;
}

async function seedIfEmpty(pool) {
  const response = await pool.request().query('SELECT COUNT(1) AS [count] FROM dbo.users');
  const count = Number(response.recordset?.[0]?.count || 0);
  if (count > 0) {
    return;
  }

  const legacyData = await readLegacyJsonData();
  const initialData = legacyData || seedData();
  await replaceDbData(pool, initialData);
}

async function ensureDb() {
  const pool = await getPool();
  await createSchema(pool);
  await seedIfEmpty(pool);
}

function mapQuestions(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        examId: row.exam_id,
        content: row.content,
        options: [],
        correctOptionId: row.correct_option_id,
        explanation: row.explanation || ''
      });
    }

    if (row.option_id !== null && row.option_id !== undefined) {
      map.get(row.id).options.push({
        id: row.option_id,
        text: row.option_text
      });
    }
  }
  return Array.from(map.values());
}

function mapResults(rows) {
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id,
        studentId: row.student_id,
        examId: row.exam_id,
        startTime: row.start_time,
        submitTime: row.submit_time,
        answers: [],
        correctCount: Number(row.correct_count),
        totalQuestions: Number(row.total_questions),
        score: Number(row.score),
        status: row.status
      });
    }

    if (row.question_id !== null && row.question_id !== undefined) {
      map.get(row.id).answers.push({
        questionId: row.question_id,
        selectedOptionId: row.selected_option_id
      });
    }
  }
  return Array.from(map.values());
}

async function readDb() {
  await ensureDb();
  const pool = await getPool();

  const userRows = await pool.request().query(`
    SELECT id, username, full_name, email, password, role
    FROM dbo.users
    ORDER BY id
  `);
  const users = userRows.recordset.map((row) => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      password: row.password,
      role: row.role
    }));

  const examRows = await pool.request().query(`
    SELECT id, title, description, type, start_time, end_time, duration, status
    FROM dbo.exams
    ORDER BY id
  `);
  const exams = examRows.recordset.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      startTime: row.start_time ? new Date(row.start_time).toISOString() : undefined,
      endTime: row.end_time ? new Date(row.end_time).toISOString() : undefined,
      duration: Number(row.duration),
      status: row.status
    }));

  const questionRowsResponse = await pool.request().query(`
    SELECT
      q.id,
      q.exam_id,
      q.content,
      q.correct_option_id,
      q.explanation,
      qo.option_id,
      qo.[text] AS option_text,
      qo.id AS option_row_id
    FROM dbo.questions q
    LEFT JOIN dbo.question_options qo ON qo.question_id = q.id
    ORDER BY q.id, qo.id
  `);
  const questionRows = questionRowsResponse.recordset;

  const resultRowsResponse = await pool.request().query(`
    SELECT
      r.id,
      r.student_id,
      r.exam_id,
      r.start_time,
      r.submit_time,
      r.correct_count,
      r.total_questions,
      r.score,
      r.status,
      ra.question_id,
      ra.selected_option_id,
      ra.id AS answer_row_id
    FROM dbo.results r
    LEFT JOIN dbo.result_answers ra ON ra.result_id = r.id
    ORDER BY r.id, ra.id
  `);
  const resultRows = resultRowsResponse.recordset;

  return normalizeDb({
    users,
    exams,
    questions: mapQuestions(questionRows),
    results: mapResults(resultRows)
  });
}

async function writeDb(payload) {
  await ensureDb();
  const pool = await getPool();
  const normalized = normalizeDb(payload);
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() => replaceDbData(pool, normalized));
  await writeQueue;
  return normalized;
}

export { ensureDb, readDb, writeDb };
