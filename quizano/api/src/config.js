import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const port = Number(process.env.PORT || 8080);
export const jwtSecret = process.env.JWT_SECRET || 'quizano_dev_secret_change_me';

export const sqlServerConfig = {
	server: process.env.SQLSERVER_HOST || 'localhost',
	port: Number(process.env.SQLSERVER_PORT || 1433),
	database: process.env.SQLSERVER_DATABASE || 'quizano',
	user: process.env.SQLSERVER_USER || 'sa',
	password: process.env.SQLSERVER_PASSWORD || 'YourStrong!Passw0rd',
	options: {
		encrypt: String(process.env.SQLSERVER_ENCRYPT || 'false').toLowerCase() === 'true',
		trustServerCertificate: String(process.env.SQLSERVER_TRUST_CERT || 'true').toLowerCase() === 'true'
	},
	pool: {
		max: Number(process.env.SQLSERVER_POOL_MAX || 10),
		min: 0,
		idleTimeoutMillis: 30000
	}
};

export const legacyJsonFilePath = path.join(__dirname, 'data', 'db.json');
