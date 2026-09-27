const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { createEventDb, mysqlUtcToSydneyIso } = require('../event_db');

test('UTC timestamps format with the correct Sydney daylight-saving offset', () => {
  assert.equal(mysqlUtcToSydneyIso('2026-10-16 23:00:00'), '2026-10-17T10:00:00+11:00');
  assert.equal(mysqlUtcToSydneyIso('2027-05-14 23:00:00'), '2027-05-15T09:00:00+10:00');
});

test('query applies visibility, date, location and category with parameters', async () => {
  const calls = [];
  const db = createEventDb({
    async execute(sql, values) {
      calls.push({ sql, values });
      return [[]];
    }
  }, () => new Date('2026-09-27T00:00:00Z'));
  await db.listEvents({ date: '2026-10-17', location: '100%_!', category: 2 });
  assert.match(calls[0].sql, /e\.is_suspended = FALSE/);
  assert.match(calls[0].sql, /e\.end_at_utc > \?/);
  assert.match(calls[0].sql, /e\.start_local_date = \?/);
  assert.match(calls[0].sql, /e\.category_id = \?/);
  assert.deepEqual(calls[0].values, [
    '2026-09-27 00:00:00', '2026-10-17', '%100!%!_!!%', '%100!%!_!!%', 2
  ]);
  await db.getEvent(7);
  assert.match(calls[1].sql, /e\.is_suspended = FALSE AND e\.end_at_utc > \?/);
  assert.deepEqual(calls[1].values, [7, '2026-09-27 00:00:00']);
});

test('all seeded Sydney start dates agree with their UTC timestamps', () => {
  const seed = fs.readFileSync(path.join(__dirname, '..', 'seed.sql'), 'utf8');
  const entries = [...seed.matchAll(/^\s*\(\d+, 1, \d+, '[^']+', '([^']+)', '[^']+',\s*\r?\n\s*'([^']+)'/gm)];
  assert.equal(entries.length, 11);
  for (const [, utcStart, localDate] of entries) {
    assert.equal(mysqlUtcToSydneyIso(utcStart).slice(0, 10), localDate);
  }
  assert.equal((seed.match(/NULL, FALSE\)/g) || []).length, 10);
  assert.equal((seed.match(/NULL, TRUE\)/g) || []).length, 1);
});
