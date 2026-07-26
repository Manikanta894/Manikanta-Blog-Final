# MANII'S JOURNAL

> A premium, self-owned digital publication & personal media OS.
> Ideas. Life. Business. Intelligence.

This repository is **fully portable** — clone it, set env vars, and run it anywhere:
local Docker, Vercel, Railway, Render, or your own VPS. Zero lock-in.

## Stack

| Layer          | Tech                                            |
| -------------- | ----------------------------------------------- |
| Frontend       | Next.js 15, React 19, TailwindCSS, Framer Motion|
| Backend        | Next.js API routes (thin) + `/packages`         |
| Database       | Postgres (Supabase) **or** MongoDB (dev/legacy) |
| Storage        | Supabase Storage (or S3-compatible)             |
| Search         | Typesense                                       |
| Automation     | n8n (self-hosted) + Vercel Cron                 |
| Analytics      | Umami (self-hosted)                             |
| AI             | Groq → OpenRouter (free tier) → mock fallback   |
| Image gen      | Pollinations AI (free)                          |

## Layout

```
.
├─ app/                    # Next.js 15 App Router (frontend + api routes)
│  ├─ (public)/             — home, sections, journal, search, newsletter, about
│  ├─ admin/                — studio dashboard
│  └─ api/[[...path]]/      — thin route handlers, all logic in /packages
├─ packages/
│  ├─ db/                   — repository interface + mongo & supabase adapters
│  │  ├─ adapters/mongo.js
│  │  ├─ adapters/supabase.js
│  │  ├─ schema.sql          — full Postgres DDL + RLS
│  │  ├─ seed.sql
│  │  └─ migrate.js          — Mongo → Supabase migration
│  ├─ ai/                   — Groq / OpenRouter / Pollinations
│  ├─ social/               — LinkedIn / Instagram generators + posters
│  ├─ automation/           — RSS ingest, scheduler, newsletter
│  ├─ types/                — shared JSDoc types
│  └─ utils/                — slugify, sections config, safeJson
├─ apps/                    # Monorepo promotion targets (README + guide)
│  ├─ web/                  — the Next.js app (currently at repo root)
│  ├─ admin/                — optional separate admin surface
│  └─ api/                  — optional standalone API service
├─ docker/
│  ├─ Dockerfile.web
│  └─ docker-compose.yml    — full self-hosted stack
├─ docs/
│  ├─ DEPLOYMENT.md         — Vercel / Railway / Render
│  ├─ SELF_HOSTING.md       — Docker + VPS
│  ├─ MIGRATION.md          — Mongo → Supabase
│  └─ ARCHITECTURE.md       — topology + monorepo promotion
└─ .env.example
```

## Quick start (5 minutes, no external services)

```bash
git clone <this-repo> maniis-journal && cd maniis-journal
cp .env.example .env.local
yarn install
# Uses MongoDB by default. Start a local mongo (or set MONGO_URL to a cloud one):
docker run -d --name mongo -p 27017:27017 mongo:7
yarn dev
# Open http://localhost:3000 — demo articles are seeded on first load.
```

## Production (Supabase + full stack)

```bash
cp .env.example .env
# Edit .env: set DB_DRIVER=supabase and fill SUPABASE_URL / *_KEY

# 1. Provision schema on your Supabase project:
psql "$SUPABASE_DB_URL" -f packages/db/schema.sql -f packages/db/seed.sql
# (or paste the SQL into Supabase Studio > SQL editor)

# 2. Bring up the ancillary services (Typesense, n8n, Umami, web):
docker compose -f docker/docker-compose.yml --env-file .env up -d

# 3. Migrate any existing MongoDB data (optional):
node packages/db/migrate.js
```

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for Vercel / Railway / Render walkthroughs.

## The `/packages` are framework-agnostic

You can pull `packages/db` or `packages/ai` into any other Node runtime (Fastify,
Hono, Cloudflare Workers with adjustments). This keeps the door open to splitting
into `apps/web` + `apps/api` when scale demands it — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## License

Proprietary — owned by Manii. Use it. Modify it. Deploy it wherever you want.
