# Deployment

MANII'S JOURNAL is a single Next.js app plus optional companion services
(Typesense, n8n, Umami). It runs anywhere Node 20+ runs.

## Option 1 — Vercel (recommended for the web app)

1. Push this repo to GitHub.
2. Create a new Vercel project pointing at the repo.
3. Set environment variables (copy from `.env.example`):
   - `DB_DRIVER=supabase`
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROQ_API_KEY` (optional — site works without it)
   - `NEXT_PUBLIC_BASE_URL=https://your-domain.com`
   - `CRON_SECRET=<long-random>`
4. **Vercel Cron** — add `vercel.json`:
   ```json
   {
     "crons": [
       { "path": "/api/automation/scheduler-run", "schedule": "*/5 * * * *" },
       { "path": "/api/automation/social-dispatch", "schedule": "*/15 * * * *" },
       { "path": "/api/automation/rss-ingest",    "schedule": "0 * * * *"   }
     ]
   }
   ```
5. Deploy. Done.

## Option 2 — Railway

1. Create a Railway project. Add the repo as a service.
2. Add a **Postgres** plugin (or point at Supabase).
3. Copy env vars from `.env.example`. Set `DB_DRIVER=supabase` and use the
   plugin connection string via `SUPABASE_URL` if using Supabase self-hosted;
   or use direct `postgres://` in a future adapter.
4. Add cron jobs in Railway pointing at the same `/api/automation/*` endpoints
   with `Authorization: Bearer $CRON_SECRET` headers.

## Option 3 — Render

1. Create a **Web Service** → build command `yarn build`, start command `yarn start`.
2. Add a **PostgreSQL** database.
3. Set env vars (same as Vercel).
4. Add cron jobs via Render's **Cron Job** services hitting the automation endpoints.

## Option 4 — Docker on a VPS

See **[SELF_HOSTING.md](SELF_HOSTING.md)**.

## Domain & DNS

Point your DNS at the deployment. Set `NEXT_PUBLIC_BASE_URL` to your canonical URL.

## Cron endpoints (protected)

All `/api/automation/*` endpoints accept a `Authorization: Bearer $CRON_SECRET`
header (add auth check if you're worried — currently they're open in dev).

| Endpoint                              | Purpose                          | Suggested schedule |
| ------------------------------------- | -------------------------------- | ------------------ |
| `POST /api/automation/rss-ingest`     | Pull RSS feeds → seed AI Studio  | hourly             |
| `POST /api/automation/scheduler-run`  | Publish articles whose time came | every 5 minutes    |
| `POST /api/automation/social-dispatch`| Push queued LinkedIn/Instagram   | every 15 minutes   |
| `POST /api/automation/newsletter-send`| Send a newsletter draft          | manual / weekly    |

## First-time setup checklist

- [ ] Apply `packages/db/schema.sql` to your Postgres.
- [ ] Apply `packages/db/seed.sql` for category rows.
- [ ] Add `GROQ_API_KEY` in Settings (via `/admin`) or env var.
- [ ] Configure n8n webhook in Settings (optional).
- [ ] Configure LinkedIn / Instagram OAuth in Settings (optional).
- [ ] Add Umami website in Settings for analytics (optional).
- [ ] Set up cron jobs.
