# Self-Hosting with Docker

Everything runs on your own hardware. No paid APIs required.

## One command

```bash
cp .env.example .env
# edit .env — at minimum set POSTGRES_PASSWORD and UMAMI_APP_SECRET

docker compose -f docker/docker-compose.yml --env-file .env up -d
```

That brings up:

| Service     | URL                     | Purpose                          |
| ----------- | ----------------------- | -------------------------------- |
| web         | http://localhost:3000   | The site                         |
| postgres    | localhost:5432          | Primary database                 |
| mongodb     | localhost:27017         | Legacy / migration source        |
| typesense   | http://localhost:8108   | Full-text search                 |
| n8n         | http://localhost:5678   | Automation workflows             |
| umami       | http://localhost:3001   | Analytics dashboard              |

## First-run steps

1. Postgres is auto-initialised with `packages/db/schema.sql` and `seed.sql`.
2. Open http://localhost:5678 and create your n8n admin user.
3. Open http://localhost:3001 and create your Umami admin (default: admin/umami).
4. Add a **website** in Umami; copy the website-id into your `.env` as
   `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.
5. Open http://localhost:3000/admin → Settings and paste your Groq API key.

## Choosing your DB driver

- `DB_DRIVER=mongo` — uses the mongo container. Great for dev.
- `DB_DRIVER=supabase` — point at:
  - The bundled `postgres` service via a small Postgres adapter, **or**
  - A full Supabase self-host stack (recommended for auth + storage).

### Full Supabase self-host (recommended for prod)

Supabase publishes an official docker stack. Clone it *alongside* this repo:

```bash
git clone --depth 1 https://github.com/supabase/supabase
cp supabase/docker/.env.example supabase/docker/.env
# edit the .env (set POSTGRES_PASSWORD, JWT_SECRET, DASHBOARD credentials…)
docker compose -f supabase/docker/docker-compose.yml up -d
```

Then apply our schema:

```bash
psql "postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/postgres" \
  -f packages/db/schema.sql -f packages/db/seed.sql
```

And in **this** repo's `.env`, set:

```
DB_DRIVER=supabase
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_ROLE_KEY=<from-supabase/.env>
SUPABASE_ANON_KEY=<from-supabase/.env>
```

## Reverse proxy (production)

Use Caddy or nginx to terminate TLS in front of the `web` service on port 3000.

```caddyfile
maniis-journal.com {
  reverse_proxy localhost:3000
}
umami.maniis-journal.com {
  reverse_proxy localhost:3001
}
n8n.maniis-journal.com {
  reverse_proxy localhost:5678
}
```

## Backups

```bash
docker exec -t manii-postgres pg_dumpall -U manii > backup-$(date +%F).sql
```

Rotate to S3/B2/local disk on a cron.
