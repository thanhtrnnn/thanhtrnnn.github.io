import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedData } from '../src/data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const envPath = path.join(projectRoot, '.env');
dotenv.config({ path: envPath });

const forceReseed = process.argv.includes('--force');

function hasSeedableData(payload) {
  if (!payload) {
    return false;
  }

  return (
    payload.users.length > 0 ||
    payload.exams.length > 0 ||
    payload.questions.length > 0 ||
    payload.results.length > 0
  );
}

async function main() {
  const { ensureDb, readDb, writeDb, closeDbConnection } = await import('../src/lib/db.js');
  const { sqlServerConfig } = await import('../src/config.js');

  console.log(
    `[db:init] SQL Server target: ${sqlServerConfig.server}:${sqlServerConfig.port}/${sqlServerConfig.database}`
  );

  try {
    await ensureDb();

    const current = await readDb();
    const hasData = hasSeedableData(current);

    if (hasData && !forceReseed) {
      console.log('[db:init] Database already has data, skip seed. Use --force to reseed.');
      return;
    }

    const payload = seedData();
    await writeDb(payload);

    console.log(
      forceReseed
        ? '[db:init] Reseed completed successfully.'
        : '[db:init] Database initialized and seeded successfully.'
    );
  } finally {
    await closeDbConnection();
  }
}

main().catch((error) => {
  console.error('[db:init] Failed:', error.message);
  process.exit(1);
});
