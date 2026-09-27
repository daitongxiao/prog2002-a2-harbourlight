const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

function listen(server) { return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port))); }
async function freePort() { const server = http.createServer(); const port = await listen(server); await new Promise((resolve) => server.close(resolve)); return port; }
async function ready(url) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try { const response = await fetch(url); if (response.ok) return; } catch { /* startup pending */ }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Client server did not start');
}

test('serves three pages and forwards JSON API status and query', async () => {
  let lastUrl;
  const api = http.createServer((request, response) => {
    lastUrl = request.url;
    response.writeHead(request.url.startsWith('/api/events/999') ? 404 : 200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(request.url.startsWith('/api/events/999') ? { error: { message: 'Event not found' } } : { data: [] }));
  });
  const apiPort = await listen(api);
  const port = await freePort();
  const client = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..', env: { ...process.env, PORT: String(port), API_ORIGIN: `http://127.0.0.1:${apiPort}` }, stdio: 'ignore'
  });
  try {
    await ready(`http://127.0.0.1:${port}/`);
    for (const page of ['/', '/search.html', '/event.html']) {
      const response = await fetch(`http://127.0.0.1:${port}${page}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(await response.text(), /harbourlight/i);
    }
    const query = '/api/events?date=2026-10-01&location=Gold+Coast&category=2';
    const events = await fetch(`http://127.0.0.1:${port}${query}`);
    assert.equal(events.status, 200); assert.equal(lastUrl, query); assert.deepEqual(await events.json(), { data: [] });
    const missing = await fetch(`http://127.0.0.1:${port}/api/events/999`);
    assert.equal(missing.status, 404); assert.equal((await missing.json()).error.message, 'Event not found');
    const blocked = await fetch(`http://127.0.0.1:${port}/api/events`, { method: 'POST' });
    assert.equal(blocked.status, 405);
    const unknown = await fetch(`http://127.0.0.1:${port}/missing.html`);
    assert.equal(unknown.status, 404);
  } finally {
    client.kill(); await once(client, 'exit');
    await new Promise((resolve) => api.close(resolve));
  }
});
