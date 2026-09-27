const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const { createApp } = require('../app');
const { createEventDb, mysqlUtcToSydneyIso } = require('../event_db');

const sample = {
  id: 7, name: 'Sample', start_at_utc: '2026-10-16 23:00:00',
  end_at_utc: '2026-10-17 02:00:00', venue: 'Community Hall', city: 'Sydney',
  purpose: 'Help the community', description: 'Sample description',
  ticket_price: '8.00', fundraising_goal: '2500.00', amount_raised: '840.00',
  image_path: null, category_id: 1, category_name: 'Community & Family',
  organisation_id: 1, organisation_name: 'Harbourlight Community Collective'
};

test('UTC values get the correct Sydney offset across daylight-saving change', () => {
  assert.equal(mysqlUtcToSydneyIso('2026-10-16 23:00:00'), '2026-10-17T10:00:00+11:00');
  assert.equal(mysqlUtcToSydneyIso('2027-05-14 23:00:00'), '2027-05-15T09:00:00+10:00');
});

test('repository applies public visibility and combined filters with bound parameters', async () => {
  const calls = [];
  const pool = {
    async execute(sql, values) {
      calls.push({ sql, values });
      return [[sample]];
    }
  };
  const db = createEventDb(pool, () => new Date('2026-09-27T00:00:00Z'));
  const events = await db.listEvents({ date: '2026-10-17', location: '100%_!', category: 1 });
  assert.equal(events.length, 1);
  assert.equal(events[0].startAt, '2026-10-17T10:00:00+11:00');
  assert.equal(events[0].ticketPrice, 8);
  assert.match(calls[0].sql, /e\.is_suspended = FALSE/);
  assert.match(calls[0].sql, /e\.end_at_utc > \?/);
  assert.match(calls[0].sql, /e\.start_local_date = \?/);
  assert.match(calls[0].sql, /e\.category_id = \?/);
  assert.deepEqual(calls[0].values, [
    '2026-09-27 00:00:00', '2026-10-17', '%100!%!_!!%', '%100!%!_!!%', 1
  ]);
  await db.getEvent(7);
  assert.match(calls[1].sql, /e\.is_suspended = FALSE AND e\.end_at_utc > \?/);
  assert.deepEqual(calls[1].values, [7, '2026-09-27 00:00:00']);
});

const received = [];
const app = createApp({
  listEvents: async filters => { received.push(filters); return [{ id: 7 }]; },
  listCategories: async () => [{ id: 1, name: 'Community & Family' }],
  getEvent: async id => id === 7 ? { id: 7 } : null
});
const server = app.listen(0);
after(() => server.close());

async function get(path) {
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`);
  return { status: response.status, body: await response.json() };
}

test('list, categories and detail API response shapes', async () => {
  assert.deepEqual(await get('/api/events?date=2026-10-17&location=Sydney&category=1'),
    { status: 200, body: { data: [{ id: 7 }] } });
  assert.deepEqual(received[0], { date: '2026-10-17', location: 'Sydney', category: 1 });
  assert.deepEqual(await get('/api/categories'),
    { status: 200, body: { data: [{ id: 1, name: 'Community & Family' }] } });
  assert.deepEqual(await get('/api/events/7'), { status: 200, body: { data: { id: 7 } } });
  assert.equal((await get('/api/events/8')).status, 404);
});

test('invalid filters and IDs return contract error', async () => {
  for (const path of [
    '/api/events?date=2026-02-30', '/api/events?category=0',
    '/api/events?location=', '/api/events?unknown=x', '/api/events/abc'
  ]) {
    const result = await get(path);
    assert.equal(result.status, 400, path);
    assert.equal(result.body.error.code, 'INVALID_INPUT');
  }
});
