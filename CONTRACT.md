# API and client contract

Base API path: `/api`. All public responses are JSON.

- `GET /api/events` returns `{ "data": [event, ...] }`. Optional `date=YYYY-MM-DD`, `location=text`, `category=positive integer`. Filters combine with AND.
- `GET /api/categories` returns `{ "data": [{ "id": 1, "name": "..." }] }`.
- `GET /api/events/:id` returns `{ "data": event }`, or HTTP 404 if unavailable or absent.
- Invalid inputs return HTTP 400 with `{ "error": { "code": "INVALID_INPUT", "message": "..." } }`; server failures return 500 with a safe message.

Event fields: `id`, `name`, `startAt`, `endAt` (ISO 8601 with Sydney offset), `venue`, `city`, `purpose`, `description`, `ticketPrice`, `fundraisingGoal`, `amountRaised`, `category` (`{id,name}`), `organisation` (`{id,name}`), `image` (local path or null). Numeric money values are JSON numbers.

The client may fetch the API from an environment-configured origin. Page links use `/event.html?id=<id>`. Register displays `This feature is currently under construction.`
