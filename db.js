const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://adv9:adv9pass@localhost:54432/adv9db',
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 500) {
    console.warn(`[db] Slow query (${duration}ms):`, text.slice(0, 120));
  }
  return res;
}

async function getClient() {
  const client = await pool.connect();
  const originalRelease = client.release.bind(client);
  const timeout = setTimeout(() => {
    console.error('[db] Client checked out for >30s, possible leak');
  }, 30000);
  client.release = () => {
    clearTimeout(timeout);
    return originalRelease();
  };
  return client;
}

async function shutdown() {
  console.log('[db] Closing pool...');
  await pool.end();
  console.log('[db] Pool closed');
}

process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });

module.exports = { pool, query, getClient, shutdown };
