import * as fs from 'fs/promises';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { sqliteFilePath, legacyJsonFilePath } from '../config.js';
import { seedData } from '../data/seedData.js';

let connection;
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

function openConnection() {
  if (!connection) {
    connection = new DatabaseSync(sqliteFilePath);
    connection.exec('PRAGMA foreign_keys = ON');
  }
  return connection;
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'student'))
    );

    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('free', 'scheduled')),
      start_time TEXT,
      end_time TEXT,
      duration INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'inactive'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      exam_id TEXT NOT NULL,
      content TEXT NOT NULL,
      correct_option_id TEXT NOT NULL,
      explanation TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS question_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      text TEXT NOT NULL,
      UNIQUE(question_id, option_id),
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      start_time TEXT NOT NULL,
      submit_time TEXT NOT NULL,
      correct_count INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      score REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id),
      FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS result_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      result_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      selected_option_id TEXT,
      FOREIGN KEY (result_id) REFERENCES results(id) ON DELETE CASCADE
    );
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

function replaceDbData(db, payload) {
  const normalized = normalizeDb(payload);

  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      DELETE FROM result_answers;
      DELETE FROM results;
      DELETE FROM question_options;
      DELETE FROM questions;
      DELETE FROM exams;
      DELETE FROM users;
    `);

    const insertUser = db.prepare('INSERT INTO users (id, username, full_name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)');
    const insertExam = db.prepare('INSERT INTO exams (id, title, description, type, start_time, end_time, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertQuestion = db.prepare('INSERT INTO questions (id, exam_id, content, correct_option_id, explanation) VALUES (?, ?, ?, ?, ?)');
    const insertOption = db.prepare('INSERT INTO question_options (question_id, option_id, text) VALUES (?, ?, ?)');
    const insertResult = db.prepare('INSERT INTO results (id, student_id, exam_id, start_time, submit_time, correct_count, total_questions, score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insertAnswer = db.prepare('INSERT INTO result_answers (result_id, question_id, selected_option_id) VALUES (?, ?, ?)');

    for (const user of normalized.users) {
      insertUser.run(user.id, user.username, user.fullName, user.email, user.password, user.role);
    }

    for (const exam of normalized.exams) {
      insertExam.run(
        exam.id,
        exam.title,
        exam.description,
        exam.type,
        exam.startTime || null,
        exam.endTime || null,
        Number(exam.duration),
        exam.status
      );
    }

    for (const question of normalized.questions) {
      insertQuestion.run(
        question.id,
        question.examId,
        question.content,
        question.correctOptionId,
        question.explanation || ''
      );

      const options = Array.isArray(question.options) ? question.options : [];
      for (const option of options) {
        insertOption.run(question.id, option.id, option.text);
      }
    }

    for (const result of normalized.results) {
      insertResult.run(
        result.id,
        result.studentId,
        result.examId,
        result.startTime,
        result.submitTime,
        Number(result.correctCount || 0),
        Number(result.totalQuestions || 0),
        Number(result.score || 0),
        result.status || 'completed'
      );

      const answers = Array.isArray(result.answers) ? result.answers : [];
      for (const answer of answers) {
        insertAnswer.run(result.id, answer.questionId, answer.selectedOptionId || null);
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return normalized;
}

async function seedIfEmpty(db) {
  const row = db.prepare('SELECT COUNT(1) AS count FROM users').get();
  const count = Number(row?.count || 0);
  if (count > 0) {
    return;
  }

  const legacyData = await readLegacyJsonData();
  const initialData = legacyData || seedData();
  replaceDbData(db, initialData);
}

async function ensureDb() {
  const dir = path.dirname(sqliteFilePath);
  await fs.mkdir(dir, { recursive: true });
  const db = openConnection();
  createSchema(db);
  await seedIfEmpty(db);
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
  const db = openConnection();

  const users = db
    .prepare('SELECT id, username, full_name, email, password, role FROM users ORDER BY id')
    .all()
    .map((row) => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      password: row.password,
      role: row.role
    }));

  const exams = db
    .prepare('SELECT id, title, description, type, start_time, end_time, duration, status FROM exams ORDER BY id')
    .all()
    .map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      startTime: row.start_time || undefined,
      endTime: row.end_time || undefined,
      duration: Number(row.duration),
      status: row.status
    }));

  const questionRows = db.prepare(`
    SELECT
      q.id,
      q.exam_id,
      q.content,
      q.correct_option_id,
      q.explanation,
      qo.option_id,
      qo.text AS option_text,
      qo.id AS option_row_id
    FROM questions q
    LEFT JOIN question_options qo ON qo.question_id = q.id
    ORDER BY q.id, qo.id
  `).all();

  const resultRows = db.prepare(`
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
    FROM results r
    LEFT JOIN result_answers ra ON ra.result_id = r.id
    ORDER BY r.id, ra.id
  `).all();

  return normalizeDb({
    users,
    exams,
    questions: mapQuestions(questionRows),
    results: mapResults(resultRows)
  });
}

async function writeDb(payload) {
  await ensureDb();
  const db = openConnection();
  const normalized = normalizeDb(payload);
  writeQueue = writeQueue
    .catch(() => undefined)
    .then(() => replaceDbData(db, normalized));
  await writeQueue;
  return normalized;
}

export { ensureDb, readDb, writeDb };
