Run the minimal schedule relay server (demo)

1. Install dependencies (from repo root):

   npm install express axios body-parser

2. Start the server (PowerShell):

   npm run server:start

Note: this server uses CORS so the front-end can call `/api/schedule` from the local dev server.

Security: to secure the endpoint set an environment variable `SCHEDULE_SECRET` on the server and set the same value in the front-end as `VITE_SCHEDULE_SECRET`. The server will reject requests missing the `x-schedule-secret` header when `SCHEDULE_SECRET` is set.

3. The server provides:
   - POST /api/schedule  -> accepts payload { platform, content, imageUrl, publishTime }
   - GET  /api/schedule  -> list saved schedules

Notes:
- This server uses a simple schedules.json file for persistence and setTimeout for demo scheduling.
- For production, replace with a persistent DB and reliable job queue/workers.
- Set environment variable ZAPIER_WEBHOOK_URL to the Zapier catch hook if different.
