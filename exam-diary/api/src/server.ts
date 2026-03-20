import app from './app';
import { port } from './config';
import { ensureDb } from './lib/db';

async function startServer() {
  try {
    console.log('Ensuring database and schema...');
    await ensureDb();
    console.log('Database is ready.');

    app.listen(port, () => {
      console.log(`Exam Diary API server running on port ${port}`);
      console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
