# FocusFlow

Personal AI Productivity & Focus Management Platform.

## Starter V1
- Dashboard
- Task management (create, edit, complete, delete)
- Pomodoro timer with editable durations
- Habit tracker
- Local persistence with `localStorage`
- PWA manifest and service worker shell cache

## Run locally
No XAMPP or backend is needed for this starter.
For PWA/service-worker testing, use a local static server (for example VS Code Live Server) or deploy to HTTPS hosting.

## Deploy
GitHub repository is the source of truth. For a private repository, connect it to Cloudflare Pages (or another host that supports private repositories). GitHub Pages on GitHub Free has plan restrictions for private repositories.

## Important current limitations
- Data is currently stored only in the browser on this device.
- No account login, cloud sync, teams, Google Calendar, push notifications, or AI integration yet.
- Do not store secrets/API keys in frontend files or this repository.
- The service worker caches the app shell; task data uses browser local storage in this starter.

## Next milestone
Replace local-only persistence with IndexedDB + Supabase, add authentication and workspace-level RLS, then implement cloud sync.
