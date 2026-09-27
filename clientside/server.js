/** Serves the public site and forwards API requests to the read-only API server. */
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const port = Number(process.env.PORT || 3000);
const apiOrigin = process.env.API_ORIGIN || 'http://localhost:4101';
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/search.html', ['search.html', 'text/html; charset=utf-8']],
  ['/event.html', ['event.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']]
]);

http.createServer(async (request, response) => {
  let url;
  try {
    url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    if (request.method !== 'GET') {
      response.writeHead(405, { Allow: 'GET' }).end('Method not allowed');
      return;
    }
    try {
      const upstream = await fetch(new URL(url.pathname + url.search, apiOrigin), {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: 'application/json' }
      });
      const body = await upstream.arrayBuffer();
      response.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      response.end(Buffer.from(body));
    } catch {
      response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ error: { code: 'API_UNAVAILABLE', message: 'Events are temporarily unavailable. Please try again.' } }));
    }
    return;
  }

  const file = files.get(url.pathname);
  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Page not found');
    return;
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  try {
    const content = await fs.readFile(path.join(__dirname, file[0]));
    response.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500).end('Unable to load page');
  }
}).listen(port, () => console.log(`Harbourlight client listening on http://localhost:${port}`));
