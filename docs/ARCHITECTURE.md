# Architecture

## Topology (current)

```
            ┌─────────────────────────────────────┐
            │              Next.js 15 (App Router)              │
            │   /                 ─ magazine + article reader   │
            │   /admin            ─ studio dashboard             │
            │   /api/[[...path]]  ─ thin handlers                 │
            └──────────┬───────────────────┬─────────────┘
                       │                       │
                       ▼                       ▼
            ┌───────────────────┐    ┌───────────────────┐
            │ /packages/db       │    │  /packages/ai       │
            │  ▸ mongo adapter   │    │  Groq → OpenRouter  │
            │  ▸ supabase adapter│    │  Pollinations       │
            └──┬────────────┬────┘    └─────────┬────────────┘
               ▼          ▼                    ▼
         MongoDB      Postgres/Supabase     external HTTP APIs

            ┌─────────────────────────────────────┐
            │ /packages/social       │ /packages/automation   │
            │   LinkedIn / IG        │   RSS, n8n, scheduler  │
            └─────────────────────────────────────┘
```

## Design principles

1. **Thin route handlers.** `/api/[[...path]]/route.js` only wires HTTP to package
   functions. Every important behaviour lives in a package.
2. **Framework-agnostic packages.** Anything under `/packages/` can be imported
   from a different Next.js app, a Fastify server, a Cloudflare Worker, or a CLI.
3. **Swappable DB.** `/packages/db` exposes the same interface for two drivers.
   No caller ever imports Mongo or Postgres directly.
4. **Nothing lock-in.** Every third-party is free or self-hostable. Groq is free.
   OpenRouter has free-tier models. Pollinations is free. Umami/n8n/Typesense are OSS.

## Promotion to full monorepo (Turborepo)

When you're ready to split, this is the promotion path (you can do it locally
any time — the packages are already isolated):

1. Move `/app` (Next.js) to `/apps/web/`.
2. If you want a separate admin build, duplicate the Next.js app in `/apps/admin/`
   and keep only the `/admin` route + `/api/*` there.
3. If you want to run automation as a standalone service, create `/apps/api/`
   as a small Hono/Fastify app that imports from `/packages/*` and only exposes
   `/api/automation/*`.
4. Add root `package.json` with `workspaces: ["apps/*", "packages/*"]`.
5. Add Turborepo (`npx turbo init`) for cached builds.

You lose nothing by delaying this — the code layout already assumes it.

## Data model

See `packages/db/schema.sql` — canonical DDL for:

- `profiles`, `articles`, `categories`, `tags`, `article_tags`
- `journal_entries`, `projects`, `media`
- `social_posts`, `social_queue`, `subscribers`, `newsletters`
- `analytics`, `automations`, `automation_logs`, `ai_queue`, `rss_sources`
- `settings`

All tables have `id uuid`, `created_at timestamptz`, and appropriate indexes.
RLS is enabled on user-facing tables with sensible policies (see the SQL file).

## Automation topology

```
  RSS feeds ───▸ /api/automation/rss-ingest ──▸ db.rssSources / logs
                                              ──▸ (optional) n8n workflow ─▸ pipelinePublish()

  cron    ─────▸ /api/automation/scheduler-run   ──▸ publish scheduled articles
  cron    ─────▸ /api/automation/social-dispatch ──▸ post queued LinkedIn/IG
  cron    ─────▸ /api/automation/newsletter-send ──▸ broadcast newsletter

  admin action ▸ /api/ai/generate ──▸ pipelinePublish() ─▸ db.articles + db.socialQueue + n8n webhook
```

`pipelinePublish` is the canonical fan-out:
generate article → cover image → social copy → write to DB → enqueue socials →
fire n8n webhook (if configured).
