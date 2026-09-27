# Harbourlight Events API

This Express service reads fictional community event data from MySQL. It implements the public JSON contract in the project root `CONTRACT.md`. The service defaults to port 4101. The frontend proxies its same-origin `/api` requests to that port.

## Install and run

1. Install Node.js 20 or newer and MySQL 8 or newer.
2. From this directory, open `mysql -u root -p` using an administrator account with database creation privileges. At the MySQL prompt run `SOURCE schema.sql;` and `SOURCE seed.sql;`.
3. Copy `create_reader.sql` to a temporary file outside the repository and replace its placeholder with a strong local password. At the same MySQL prompt run `SOURCE path/to/local-reader.sql;` using the copy's actual path. Never commit the password.
4. Run `npm ci`, copy `.env.example` to `.env`, and set `DB_PASSWORD` to the same password. Keep `.env` private.
5. Run `npm start`. The API listens on `http://localhost:4101` by default. `GET /api/events`, `GET /api/categories`, and `GET /api/events/:id` are available.

The MySQL account used by the API has only `SELECT` permission. `CLIENT_ORIGIN` is optional for direct browser calls from another origin; use a comma-separated list of exact origins. It is unnecessary when using the frontend's same-origin proxy.

## Date and visibility rules

All instants are stored as UTC `DATETIME` values. `start_local_date` stores the event's Australia/Sydney calendar date so `?date=YYYY-MM-DD` matches that local date, even if its UTC date is different. Each response instant is converted with Node's `Intl` timezone data and includes the correct Sydney `+10:00` or `+11:00` offset. An event appears only while `end_at_utc` is later than the server's current UTC time and `is_suspended` is false. The API does not expose past or suspended events, including by ID.

Date, location and category filters combine with AND. Location searches venue or city without case sensitivity; SQL wildcard characters typed by users are treated as literal characters. Invalid inputs return HTTP 400. Money fields are JSON numbers.

## Checks

Run `npm test` for deterministic API and timezone checks. With `.env` configured and the sample database seeded, run `npm run test:db` for a read-only database integration check. Start the API and request `/api/events`, `/api/categories`, and an event ID for HTTP checks. The seed contains ten public events and one suspended event. These dates are fixed sample dates and will eventually pass; reseed with new fictional dates if using the project after March 2027.
