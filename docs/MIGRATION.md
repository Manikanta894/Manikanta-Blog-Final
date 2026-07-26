# Migration — MongoDB (Emergent preview) → Supabase/Postgres (your infra)

The app supports both drivers side-by-side, so you can migrate incrementally.

## Step 1 — Prepare Supabase

1. Create a Supabase project (or start your self-hosted stack).
2. Apply schema + seed:
   ```bash
   psql "$SUPABASE_DB_URL" -f packages/db/schema.sql
   psql "$SUPABASE_DB_URL" -f packages/db/seed.sql
   ```
   (Or paste both files into Supabase Studio → SQL Editor.)

## Step 2 — Export & import

```bash
# Set env vars for both databases:
export MONGO_URL="mongodb://<...emergent-mongo-url>"
export DB_NAME="manii_journal"
export SUPABASE_URL="https://your-proj.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Run the one-shot migrator:
node packages/db/migrate.js
```

Migrates: `articles`, `journal_entries`, `media`, `ai_queue`, `social_queue`,
`rss_sources`, `subscribers`, `automation_logs`, `settings`.

## Step 3 — Cut over

In your `.env` (or hosting provider env vars) change:

```
DB_DRIVER=supabase
```

Redeploy. That's it — the app now serves from Postgres.

## Step 4 — Post-migration checks

- Open `/admin` — the Overview counts should match your old dashboard.
- Open `/journal` — entries should be present.
- Visit the homepage — all sections should populate.
- Search should now use Postgres full-text (indexed via `search_vector` in `schema.sql`).

## Rollback

Set `DB_DRIVER=mongo` and redeploy. Your MongoDB data is untouched.
