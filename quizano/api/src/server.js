import 'dotenv/config';
import app from './app.js';
import { port } from './config.js';
import { ensureDb } from './lib/db.js';

async function bootstrap() {
  await ensureDb();
  app.listen(port, () => {
    console.log(`Quizano API running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
