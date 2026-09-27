# Harbourlight Community Events

This is a fictional charity events website for PROG2002 Assessment 2. The `api` directory contains the MySQL schema, seed data, read-only Express API and tests. The `clientside` directory contains the HTML, CSS and plain JavaScript website plus its same-origin API proxy. The report uses the supplied Word template; the English and Chinese demo script is in `docs`.

## Start locally

Install Node.js 20 or newer and MySQL 8 or newer. From `api`, import `schema.sql` and `seed.sql` using a MySQL administrator. Copy `create_reader.sql` outside the repository, replace its password placeholder and run it as an administrator. Run `npm ci`, copy `.env.example` to `.env`, set the same read-only password and your MySQL host/port, then run `npm start`. See [API setup](api/README.md).

In another terminal, run `npm ci` and `npm start` from `clientside`. Open [http://localhost:3000](http://localhost:3000). The client proxies `/api` to `http://localhost:4101` by default. See [client setup](clientside/README.md).

The seed contains ten public future events and one suspended sample relative to September 2026. These fixed dates will eventually expire. To use the example later, replace the fictional sample dates while keeping `start_at_utc`, `end_at_utc` and `start_local_date` consistent.

## Verify

Run `npm test` in both directories. With MySQL and `api/.env` configured, run `npm run test:db` from `api`. The [verification record](docs/VERIFICATION.md) distinguishes automated checks, database checks and manual browser work. The project does not implement registration, payments or write API methods. Register opens the construction message required by A2.

## Submission material

- [Filled report](delivery/PROG2002%20A2%20Report.docx). Student ID and name fields are blank for the student to complete.
- [Bilingual demo script](docs/VIDEO-SCRIPT.md). It is a rehearsal aid; the student must record and upload the actual video.
- `delivery/USERNAMEA2-api.zip` and `delivery/USERNAMEA2-clientside.zip` are the source packages. Replace `USERNAME` with the course-required prefix when known.
- [Public GitHub repository](https://github.com/daitongxiao/prog2002-a2-harbourlight). The user explicitly requested public visibility. The assessment brief says other students should not access the work, so this visibility should be checked against the course's marking instructions before submission.

No private `.env`, credentials, `node_modules`, temporary database files or test render images belong in the source packages.
