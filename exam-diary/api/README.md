# Exam Diary API

This is the backend API for the Exam Diary project, built with [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), and connected to a **Microsoft SQL Server** database. The structure and database architecture is heavily inspired by the Quizano platform.

## 🚀 Technologies

- **Node.js** & **Express**
- **TypeScript**
- **MS SQL Server** for database (`mssql` module)
- **JWT** (JSON Web Tokens) for authenticating users
- **SwaggerUI** (OpenAPI 3.0) for API documentation
- **Cors** & **Helmet** for basic security

## 📁 Project Structure

```bash
exam-diary/api/
├── README.md               # You are here
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
├── src/
│   ├── app.ts              # Express initialization & middleware
│   ├── server.ts           # Server start, database connection
│   ├── config.ts           # Environment variables & constants
│   ├── lib/                # Database pool & generic utilities
│   │   └── db.ts           # Database connection via MS SQL
│   ├── data/               # Dummy seed data or local JSON fallback
│   ├── docs/               # OpenAPI documentation files
│   ├── middleware/         # Express middlewares (auth, error handling)
│   └── routes/             # Express routes (auth, exams, users, etc.)
└── scripts/
    └── init-mssql.ts       # Script to initialise schema & database
```

## 🛠️ Setup Instructions

### 1. Prerequisites
- **Node.js**: `v18.x` or later.
- **SQL Server**: Ensure you have Microsoft SQL Server installed (locally via Developer Edition / Docker, or remote).

### 2. Install Dependencies
```bash
cd exam-diary/api
npm install
```

### 3. Environment Variables
Create a `.env` file in the root of the `api` folder and define your database credentials:

```ini
PORT=4000
JWT_SECRET=your_dev_secret_key

# SQL Server Configurations
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_DATABASE=exam_diary
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=YourStrong!Passw0rd
SQLSERVER_ENCRYPT=false
SQLSERVER_TRUST_CERT=true
```

### 4. Database Setup & Initialization
To create the database and required tables (Users, Exams, Questions, Options, Results), run the database init script:

```bash
# Initialize DB structure only
npm run db:init

# Optional: Initialize and force seed mock data
npm run db:seed:force
```

### 5. Running the Application

**Development (Hot-Reload with `ts-node` & `nodemon`)**
```bash
npm run dev
```

**Production Build**
```bash
npm run build
npm start
```

## 📖 API Documentation
Once the server is running, the Swagger documentation is accessible at:
[http://localhost:4000/api-docs](http://localhost:4000/api-docs)

## 🗄️ Database ERD Summary
Similar to Quizano, the database uses normalized tables:
- **`users`**: Role-based (admin, student) authentication system.
- **`exams`**: Exam metadata (title, status, schedule).
- **`questions`**: Bound to exams via foreign keys, contains questions.
- **`question_options`**: Options mapped to specific questions.
- **`results`** & **`result_answers`**: Tracking student submissions, timing, and scores.
