import path from 'path';
import dotenv from 'dotenv';
import { env } from 'process';

dotenv.config();

const rootDir = process.cwd();

export const port = Number(env.PORT || 4000);
export const jwtSecret = env.JWT_SECRET || 'exam_diary_dev_secret_change_me';

export const sqlServerConfig = {
  server: env.SQLSERVER_HOST || 'localhost',
  port: Number(env.SQLSERVER_PORT || 1433),
  database: env.SQLSERVER_DATABASE || 'exam_diary',
  user: env.SQLSERVER_USER || 'sa',
  password: env.SQLSERVER_PASSWORD || 'YourStrong!Passw0rd',
  options: {
    encrypt: String(env.SQLSERVER_ENCRYPT || 'false').toLowerCase() === 'true',
    trustServerCertificate: String(env.SQLSERVER_TRUST_CERT || 'true').toLowerCase() === 'true'
  },
  pool: {
    max: Number(env.SQLSERVER_POOL_MAX || 10),
    min: 0,
    idleTimeoutMillis: 30000
  }
};

export const legacyJsonFilePath = path.join(rootDir, 'src', 'data', 'db.json');
