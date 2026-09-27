const express = require('express');

function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function positiveId(value, label) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw invalid(`${label} must be a positive integer.`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > 4294967295) {
    throw invalid(`${label} is out of range.`);
  }
  return number;
}

function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw invalid('date must use YYYY-MM-DD.');
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() + 1 !== month || parsed.getUTCDate() !== day) {
    throw invalid('date must be a real calendar date.');
  }
  return value;
}

function parseFilters(query) {
  const filters = {};
  for (const key of Object.keys(query)) {
    if (!['date', 'location', 'category'].includes(key)) throw invalid(`Unknown filter: ${key}.`);
  }
  if (query.date !== undefined) filters.date = parseDate(query.date);
  if (query.category !== undefined) filters.category = positiveId(query.category, 'category');
  if (query.location !== undefined) {
    if (typeof query.location !== 'string') throw invalid('location must be text.');
    const location = query.location.trim();
    if (!location || location.length > 100) throw invalid('location must contain 1 to 100 characters.');
    filters.location = location;
  }
  return filters;
}

function createApp(db, options = {}) {
  const app = express();
  app.disable('x-powered-by');
  const allowedOrigins = (options.clientOrigin || '').split(',').map(x => x.trim()).filter(Boolean);
  app.use((req, res, next) => {
    const origin = req.get('Origin');
    if (origin && allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Vary', 'Origin');
    }
    next();
  });

  app.get('/api/events', async (req, res) => {
    res.json({ data: await db.listEvents(parseFilters(req.query)) });
  });
  app.get('/api/categories', async (_req, res) => {
    res.json({ data: await db.listCategories() });
  });
  app.get('/api/events/:id', async (req, res) => {
    const event = await db.getEvent(positiveId(req.params.id, 'id'));
    if (!event) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Event not found.' } });
    res.json({ data: event });
  });
  app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint not found.' } });
  });
  app.use((error, _req, res, _next) => {
    if (error.status === 400) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: error.message } });
    }
    console.error('API request failed:', error);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'An internal error occurred.' } });
  });
  return app;
}

module.exports = { createApp, parseFilters, positiveId, parseDate };
