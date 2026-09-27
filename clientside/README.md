# Harbourlight public site

This dependency-free Node.js client serves three responsive pages: home, event search and event detail. It forwards browser requests from `/api/*` to the backend API on the server side, keeping all browser requests on one origin.

## Run

With Node.js 20 or newer, run `npm start` in this directory and open `http://localhost:3000`. Start the API separately on port 4101. Set `PORT` to change the client port and `API_ORIGIN` to change the API address (for example `http://localhost:4101`). No `.env` file or install step is required for the client.

Run `npm test` to check static pages, proxy forwarding, status propagation, and rejected methods. The artwork is original CSS and HTML illustration. It uses no downloaded or third-party images. Google Fonts is an optional enhancement; local system font fallbacks are included.

The date filter means the event's Sydney local start date. Location searches city or venue, and the three filters combine. Events and categories come from the API; the client has no hard-coded event records. Register shows the required construction message without collecting personal information.
