# Verification record

The checks below were performed on 27 September 2026 for this new implementation. The local runtime was Windows, Node.js 24.11.0 and a temporary, separate MySQL 8.4.11 instance. The database was imported from `api/schema.sql` and `api/seed.sql`, with a `SELECT`-only application account. Local test settings are ignored by Git.

## Automated and database checks

| Check | Actual result |
| --- | --- |
| `api: npm test` | 7 of 7 passed: Sydney offset across daylight saving, public visibility, bound filter values, response shape, invalid inputs, UTC to local date consistency. |
| `api: npm run test:db` | Passed against imported MySQL: five categories, ten public events, date filter, suspended and past event exclusion. |
| HTTP requests against running API | `/api/events` 200 with ten records; `/api/categories` 200 with five; `/api/events/1` 200 with Sydney +11:00 offset; `/api/events/11` 404; combined date and category 200 with one record; invalid date 400. |
| Database permission check | Application reader had `USAGE` and `SELECT` only. |
| `clientside: npm test` | 2 of 2 passed: server proxy/page contract and unknown-category URL query handling. |
| JavaScript syntax checks | `node --check` passed for client application and server scripts. |
| Extracted source packages | Both ZIPs passed CRC checks, contained only allowlisted source files, and were extracted into a new QA directory. Offline `npm ci` succeeded in both; extracted API and client on separate ports returned ten events, five categories and the detail page through the proxy. |

## Manual browser checks

The three pages were exercised against the real imported MySQL API through the client proxy. Home displayed all ten public events. Search displayed five categories; date `2026-10-31` plus Environment returned Coast Care Planting Day, and adding Wollongong still returned one result. Clear filters reset the fields, URL and ten-result list. Event ID 1 displayed 17 October 2026 at 10:00 am to 1:00 pm Sydney time. The Register modal showed `This feature is currently under construction.` and returned focus after closing. A direct unknown category URL retained the selected unknown category and showed zero results; Clear filters restored ten. Desktop and 390-pixel mobile layouts were checked without horizontal overflow. The service-failure state was also checked before the API was started.

These checks are bounded observations, not proof of every browser, device or accessibility standard. They do not establish that the video has been recorded, the repository satisfies marker access rules, or Blackboard submission has occurred.

The filled report was generated from a copy of the supplied template. All original package parts except the edited document body and the anonymised core metadata are unchanged. Its four rendered A4 pages were visually inspected for readable text, intact prompts, blank student identity fields, and clean page breaks. The original template hash remained unchanged.

## Known limits

- The `start_local_date` column is redundant with the UTC start time and must be updated consistently if events are edited later. Current seed values were checked; A2 exposes no write endpoint.
- Fixed sample dates eventually become past events. Import fresh fictional dates for a later demonstration and recalculate their Sydney dates.
- Visuals are original CSS illustration, not photographs of real events.
- Public repository visibility was requested by the user but may conflict with the brief's instruction to prevent access by other students.
