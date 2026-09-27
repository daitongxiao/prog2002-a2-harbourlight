const SYDNEY_TZ = 'Australia/Sydney';

function createPool(config = process.env) {
  const mysql = require('mysql2/promise');
  return mysql.createPool({
    host: config.DB_HOST || '127.0.0.1',
    port: Number(config.DB_PORT || 3306),
    user: config.DB_USER || 'harbourlight_reader',
    password: config.DB_PASSWORD,
    database: config.DB_NAME || 'charityevents_db',
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
    dateStrings: true,
    decimalNumbers: true
  });
}

function mysqlUtcToSydneyIso(value) {
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    throw new TypeError('Expected a UTC MySQL DATETIME string');
  }
  const date = new Date(value.replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.valueOf())) throw new TypeError('Invalid UTC date');
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: SYDNEY_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23', timeZoneName: 'longOffset'
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  const offset = parts.timeZoneName.replace('GMT', '');
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

function toEvent(row) {
  return {
    id: row.id,
    name: row.name,
    startAt: mysqlUtcToSydneyIso(row.start_at_utc),
    endAt: mysqlUtcToSydneyIso(row.end_at_utc),
    venue: row.venue,
    city: row.city,
    purpose: row.purpose,
    description: row.description,
    ticketPrice: Number(row.ticket_price),
    fundraisingGoal: Number(row.fundraising_goal),
    amountRaised: Number(row.amount_raised),
    category: { id: row.category_id, name: row.category_name },
    organisation: { id: row.organisation_id, name: row.organisation_name },
    image: row.image_path
  };
}

const eventColumns = `
  e.id, e.name, e.start_at_utc, e.end_at_utc, e.venue, e.city,
  e.purpose, e.description, e.ticket_price, e.fundraising_goal,
  e.amount_raised, e.image_path,
  c.id AS category_id, c.name AS category_name,
  o.id AS organisation_id, o.name AS organisation_name`;

const eventTables = `
  FROM events e
  JOIN categories c ON c.id = e.category_id
  JOIN organisations o ON o.id = e.organisation_id`;

function createEventDb(pool, now = () => new Date()) {
  function currentUtcSql() {
    return now().toISOString().slice(0, 19).replace('T', ' ');
  }

  return {
    async listEvents(filters = {}) {
      const conditions = ['e.is_suspended = FALSE', 'e.end_at_utc > ?'];
      const values = [currentUtcSql()];
      if (filters.date) {
        conditions.push('e.start_local_date = ?');
        values.push(filters.date);
      }
      if (filters.location) {
        conditions.push("(LOWER(e.venue) LIKE ? ESCAPE '!' OR LOWER(e.city) LIKE ? ESCAPE '!')");
        const escaped = filters.location.toLowerCase().replace(/[!%_]/g, '!$&');
        values.push(`%${escaped}%`, `%${escaped}%`);
      }
      if (filters.category) {
        conditions.push('e.category_id = ?');
        values.push(filters.category);
      }
      const [rows] = await pool.execute(
        `SELECT ${eventColumns} ${eventTables} WHERE ${conditions.join(' AND ')} ORDER BY e.start_at_utc ASC, e.id ASC`,
        values
      );
      return rows.map(toEvent);
    },

    async listCategories() {
      const [rows] = await pool.execute('SELECT id, name FROM categories ORDER BY name ASC', []);
      return rows;
    },

    async getEvent(id) {
      const [rows] = await pool.execute(
        `SELECT ${eventColumns} ${eventTables}
         WHERE e.id = ? AND e.is_suspended = FALSE AND e.end_at_utc > ? LIMIT 1`,
        [id, currentUtcSql()]
      );
      return rows.length ? toEvent(rows[0]) : null;
    }
  };
}

module.exports = { createPool, createEventDb, mysqlUtcToSydneyIso, toEvent };
