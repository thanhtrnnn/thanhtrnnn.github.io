import sql from 'mssql';
import { getPool } from '../src/lib/db';

async function createSchema(pool: sql.ConnectionPool) {
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

async function run() {
  try {
    console.log('Connecting to database and executing migrations...');
    const pool = await getPool();
    await createSchema(pool);
    console.log('Database schema checked/created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Initialization failed:', err);
    process.exit(1);
  }
}

run();
