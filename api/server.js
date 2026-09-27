require('dotenv').config();
const { createPool, createEventDb } = require('./event_db');
const { createApp } = require('./app');

const port = Number(process.env.PORT || 4101);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const pool = createPool();
const app = createApp(createEventDb(pool), { clientOrigin: process.env.CLIENT_ORIGIN });
const server = app.listen(port, () => console.log(`Harbourlight API listening on http://localhost:${port}`));

async function shutdown() {
  server.close();
  await pool.end();
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
