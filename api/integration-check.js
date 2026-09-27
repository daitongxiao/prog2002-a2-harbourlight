require('dotenv').config({ quiet: true });
const assert = require('node:assert/strict');
const { createPool, createEventDb } = require('./event_db');

async function main() {
  const pool = createPool();
  try {
    const sampleTime = () => new Date('2026-09-27T00:00:00Z');
    const db = createEventDb(pool, sampleTime);
    const categories = await db.listCategories();
    const events = await db.listEvents();
    const filtered = await db.listEvents({ date: '2026-10-17', category: 1 });
    assert.equal(categories.length, 5, 'Expected five seeded categories');
    assert.equal(events.length, 10, 'Expected ten public seeded events');
    assert.equal(filtered.length, 1, 'Expected one event on the Sydney local date');
    assert.equal(filtered[0].id, 1);
    assert.equal(filtered[0].startAt, '2026-10-17T10:00:00+11:00');
    assert.equal(await db.getEvent(11), null, 'Suspended event should stay private');
    const afterAllEvents = createEventDb(pool, () => new Date('2028-01-01T00:00:00Z'));
    assert.equal((await afterAllEvents.listEvents()).length, 0, 'Past events should be hidden');
    assert.equal(await afterAllEvents.getEvent(1), null, 'Past event detail should be hidden');
    console.log('Database integration passed: 5 categories, 10 public events, local date filter, suspended and past visibility.');
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
