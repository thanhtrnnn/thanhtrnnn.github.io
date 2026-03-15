import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const port = Number(process.env.PORT || 8080);
export const jwtSecret = process.env.JWT_SECRET || 'quizano_dev_secret_change_me';
export const sqliteFilePath = process.env.SQLITE_FILE || path.join(__dirname, 'data', 'quizano.sqlite');
export const legacyJsonFilePath = path.join(__dirname, 'data', 'db.json');
