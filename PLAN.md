# Harbourlight Community Events A2 plan

This directory is a fresh implementation of the supplied PROG2002 A2 brief. The organisation and events are fictional. The supplied A2 brief and blank report template are the assessment sources; the handoff is supporting context.

## Decisions

- Stack: Node.js, Express, MySQL, plain HTML, CSS and JavaScript with DOM and Promises. No AngularJS.
- Data is stored in `charityevents_db`; API uses a read-only database account in normal operation.
- Business timezone: Australia/Sydney. An event is upcoming while its end time is later than the server's current Sydney time. Suspended events are omitted from all public API endpoints.
- A date filter matches the event's Sydney local start date. Location is a case-insensitive substring of venue or city. Combined filters use AND.
- Public search includes active current and future events. Past events remain unavailable through public API. Register shows the exact required construction message for visible events.
- The repository is public at the user's explicit request. The assessment brief says other students should not access the work; public visibility may conflict with that condition. The user should check the course's accepted access method before submission.
- Personal identity fields in the report remain blank. The user must record and share the video.

## Stages

1. Confirm requirements, create isolated project and plan. **Done.**
2. Build MySQL schema, seed data and read-only API; run unit and database-backed checks. **Done.**
3. Build responsive home, search and event pages; integrate with real API. **Done.**
4. Test complete workflows, invalid requests and responsive layouts; record actual results. **Done for the checks in `docs/VERIFICATION.md`.**
5. Fill a copy of the provided report template from the implemented system and visually inspect every page. **Done.**
6. Prepare a bilingual, timed narration script with separate screen actions; student records the video. **Script done; recording remains with the student.**
7. Create the two required ZIPs and verify installation from extracted copies. Commit and push to the requested GitHub account. **Done.**

No test result, screenshot, commit history, recording, marker access, or grade is claimed until verified.
