# MANII'S JOURNAL — Complete Ownership & Deployment Manual

> A beginner-friendly, end-to-end guide from zero → local dev → production →
> long-term maintenance. Follow this and you own every layer.
>
> Time to complete on a fresh laptop: **~2 hours** the first time.
> Time to redeploy after that: **~2 minutes**.

---

## Table of Contents

1. [Accounts you need](#1-accounts-you-need)
2. [Environment variables — every single one explained](#2-environment-variables)
3. [Local development setup](#3-local-development-setup)
4. [Database setup (Supabase)](#4-database-setup)
5. [Deployment (Vercel)](#5-deployment-vercel)
6. [Domain configuration](#6-domain-configuration)
7. [Automation setup (n8n)](#7-automation-setup)
8. [Social media API setup (LinkedIn + Instagram)](#8-social-media-setup)
9. [Production checklist](#9-production-checklist)
10. [Future maintenance](#10-future-maintenance)

---

## 1. Accounts you need

Create these in this order. Free tier is enough for months.

| # | Account | Why you need it | Cost | Link |
|---|---|---|---|---|
| 1 | **GitHub** | Store your code + auto-deploy trigger | Free | https://github.com/signup |
| 2 | **Vercel** | Host the Next.js app (frontend + API) | Free (Hobby plan) | https://vercel.com/signup |
| 3 | **Supabase** | Postgres database + auth + file storage | Free (500MB DB, 1GB storage) | https://supabase.com |
| 4 | **Groq** | AI text generation (real articles) | Free | https://console.groq.com/keys |
| 5 | **OpenRouter** | Fallback AI when Groq is rate-limited | Free tier | https://openrouter.ai/keys |
| 6 | **Pollinations AI** | Cover-image generation | Free, **no signup needed** | https://pollinations.ai |
| 7 | **Railway** *(optional)* | Host n8n if you want automation | ~$5/mo | https://railway.app |
| 8 | **Cloudflare** *(recommended)* | DNS + free SSL + DDoS protection | Free | https://cloudflare.com |
| 9 | **Domain registrar** | You already own `manikantar.in` ✅ | — | your existing provider |
| 10 | **Google Search Console** | Get indexed on Google | Free | https://search.google.com/search-console |
| 11 | **Google Analytics** *(optional)* | Traffic tracking (or use self-hosted Umami) | Free | https://analytics.google.com |
| 12 | **LinkedIn Developer** | Auto-post to LinkedIn | Free | https://developer.linkedin.com |
| 13 | **Meta Developer** | Auto-post Instagram carousels | Free | https://developers.facebook.com |

Do #1–4 first. That gets you a live website with real AI content. Everything else is add-on.

---

## 2. Environment variables

The single source of truth is `.env.example` in the repo. Copy it once:

```bash
cp .env.example .env.local     # for local dev
cp .env.example .env           # for docker / production
```

Then fill it in. Every variable, in plain English:

| Variable | Required? | Where to get it | Where to paste it |
|---|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | **Required** | Your production URL, e.g. `https://journal.manikantar.in` | Vercel env vars **and** local `.env.local` |
| `DB_DRIVER` | **Required** | Literal string: `mongo` (dev) or `supabase` (prod) | `.env` |
| `MONGO_URL` | Only if `DB_DRIVER=mongo` | Local: `mongodb://localhost:27017`. Cloud: MongoDB Atlas free tier | `.env.local` |
| `DB_NAME` | Only if `DB_DRIVER=mongo` | Any string. Use `manii_journal` | `.env.local` |
| `SUPABASE_URL` | Only if `DB_DRIVER=supabase` | Supabase dashboard → Project Settings → API → **Project URL** | Vercel env vars |
| `SUPABASE_ANON_KEY` | Only if `DB_DRIVER=supabase` | Same page → **anon public key** | Vercel + `.env` |
| `SUPABASE_SERVICE_ROLE_KEY` | Only if `DB_DRIVER=supabase` | Same page → **service_role** (⚠ SECRET — never commit!) | Vercel env vars **only** |
| `NEXT_PUBLIC_SUPABASE_URL` | If using Supabase | Same as `SUPABASE_URL` | Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | If using Supabase | Same as `SUPABASE_ANON_KEY` | Vercel |
| `GROQ_API_KEY` | Optional but recommended | https://console.groq.com/keys → "Create API Key" → copy `gsk_…` | Vercel **or** Admin → Settings |
| `OPENROUTER_API_KEY` | Optional | https://openrouter.ai/keys → "Create Key" → copy `sk-or-…` | Vercel or Admin → Settings |
| `TYPESENSE_HOST` / `PORT` / `PROTOCOL` / `API_KEY` | Optional | Only if you self-host Typesense (see §7) | Vercel |
| `N8N_WEBHOOK_URL` | Optional | Your n8n instance's inbound webhook URL | Admin → Settings |
| `N8N_SECRET` | Optional | Random string you choose | Admin → Settings |
| `CRON_SECRET` | **Required for prod** | Generate: `openssl rand -hex 32` | Vercel env vars |
| `LINKEDIN_TOKEN` | Only for auto-posting | LinkedIn OAuth (§8) | Admin → Settings |
| `LINKEDIN_ACTOR` | Only for auto-posting | Format: `urn:li:person:XXXXX` (§8) | Admin → Settings |
| `INSTAGRAM_TOKEN` | Only for auto-posting | Meta Graph API long-lived token (§8) | Admin → Settings |
| `INSTAGRAM_ACTOR` | Only for auto-posting | Your Instagram Business Account ID (§8) | Admin → Settings |
| `NEXT_PUBLIC_UMAMI_URL` | Optional | Your self-hosted Umami URL | Vercel |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Optional | From Umami admin | Vercel |

**⚠ Golden rule**: anything **without** `NEXT_PUBLIC_` prefix is server-only. Never expose service_role keys to the browser.

---

## 3. Local development setup

**Step 1 — Install Node.js 20**

- Mac: `brew install node@20`
- Windows: download from https://nodejs.org (LTS version)
- Linux: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs`

Verify: `node -v` should print `v20.x.x`.

**Step 2 — Install Yarn**

```bash
npm install -g yarn
yarn -v      # should print 1.22.x or higher
```

**Step 3 — Install Git and clone**

```bash
git clone https://github.com/YOUR_USERNAME/maniis-journal.git
cd maniis-journal
```

(First-time: fork the repo on GitHub, then clone your fork.)

**Step 4 — Install dependencies**

```bash
yarn install
```

**Step 5 — Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DB_DRIVER=mongo
MONGO_URL=mongodb://localhost:27017
DB_NAME=manii_journal
GROQ_API_KEY=gsk_your_key_here     # optional but recommended
```

**Step 6 — Start a local MongoDB (dev only)**

```bash
docker run -d --name manii-mongo -p 27017:27017 -v manii-mongo-data:/data/db mongo:7
```

No Docker? Install MongoDB Community Server locally or use a free MongoDB Atlas cluster.

**Step 7 — Start the app**

```bash
yarn dev
```

Open http://localhost:3000. First page load auto-seeds 13 demo articles (~60 seconds if `GROQ_API_KEY` is set; instant if not — uses mock).

**Step 8 — Verify**

- Homepage renders with hero + trending
- Visit `/admin` → dashboard shows counts
- Visit `/admin` → Content Inbox → paste an idea → click **Process**

You're running locally end-to-end.

---

## 4. Database setup

You have two options:

### Option A — MongoDB (fast, dev-friendly)

Already covered in §3. Perfect for local development. Not recommended for prod.

### Option B — Supabase Postgres (recommended for production)

**Step 1 — Create Supabase project**

1. Go to https://supabase.com → **New project**
2. Name it `maniis-journal`
3. Pick a strong DB password — **save it in a password manager**
4. Choose the region nearest your audience (e.g. `Mumbai (ap-south-1)` for India)
5. Wait ~2 minutes for provisioning

**Step 2 — Apply the schema**

In Supabase dashboard: **SQL Editor → New query**.

Copy the entire contents of `packages/db/schema.sql` from your repo, paste, click **Run**.

Then repeat with `packages/db/seed.sql`.

You should see 17 tables under **Database → Tables**.

**Step 3 — Get your keys**

Dashboard → **Project Settings → API**. Copy:
- **Project URL** → `SUPABASE_URL`
- **anon** key → `SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠ secret)

**Step 4 — Create Storage buckets**

Dashboard → **Storage → New bucket**:
- `article-covers` — public
- `journal-photos` — private
- `media-library` — public

**Step 5 — Backups**

Free tier auto-backs up daily for 7 days. For self-managed backups:

```bash
pg_dump "postgresql://postgres:PASSWORD@db.YOURPROJECT.supabase.co:5432/postgres" \
        > backup-$(date +%F).sql
```

Set this as a nightly cron on any Linux box.

### Migrate your Emergent MongoDB data → Supabase

```bash
export MONGO_URL="mongodb+srv://<emergent-mongo-url>"
export DB_NAME="manii_journal"
export SUPABASE_URL="https://YOURPROJ.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

node packages/db/migrate.js
```

Then in your `.env` (both local + Vercel) flip `DB_DRIVER=supabase` and redeploy.

---

## 5. Deployment (Vercel)

**Step 1 — Push to GitHub**

```bash
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/maniis-journal.git
git push -u origin main
```

**Step 2 — Import to Vercel**

1. https://vercel.com → **Add New → Project**
2. **Import** your `maniis-journal` repo
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `.` (default)
5. **Environment Variables** → add every var from §2 that isn't optional
6. Click **Deploy**

First build takes ~3 minutes. When done you get `https://maniis-journal.vercel.app`.

**Step 3 — Test the deploy**

- Homepage renders
- `/api` returns `{ ok: true, driver: "supabase" }`
- `/admin` loads and shows stats

**Step 4 — Enable Vercel Cron**

Already configured in `vercel.json`:
- Publish scheduled articles every 5 min
- Dispatch social queue every 15 min
- Ingest RSS every hour

No action needed — it activates automatically. Verify at Vercel dashboard → your project → **Cron Jobs**.

**Step 5 — Redeployments**

Every `git push` to `main` auto-triggers a Vercel deploy. Zero-downtime, ~2 minutes.

---

## 6. Domain configuration

You own `manikantar.in`. Plan:

| Subdomain | Points to | Purpose |
|---|---|---|
| `journal.manikantar.in` | Vercel | The main site |
| `admin.manikantar.in` | Vercel (rewrite to `/admin`) | Studio |
| `api.manikantar.in` | Vercel (rewrite to `/api`) | Optional — clean API URL |
| `n8n.manikantar.in` | Railway | Automation |
| `umami.manikantar.in` | Railway/self-host | Analytics |

**Step 1 — In Vercel**

Project → **Settings → Domains → Add**:
- Type: `journal.manikantar.in`
- Type: `admin.manikantar.in`
- Type: `api.manikantar.in`

Vercel shows you a CNAME target like `cname.vercel-dns.com`.

**Step 2 — At your DNS provider (recommended: Cloudflare)**

If not using Cloudflare yet, add your domain there first (Cloudflare → Add Site → follow the nameserver change instructions at your registrar).

Then in Cloudflare **DNS → Records**:

| Type | Name | Content | Proxy status |
|---|---|---|---|
| CNAME | journal | cname.vercel-dns.com | DNS only (grey cloud) |
| CNAME | admin | cname.vercel-dns.com | DNS only |
| CNAME | api | cname.vercel-dns.com | DNS only |
| CNAME | n8n | your-n8n.railway.app | Proxied |
| CNAME | umami | your-umami.railway.app | Proxied |

**Important:** Vercel domains must use **DNS only** (grey cloud) or Cloudflare's proxy will conflict with Vercel's SSL.

**Step 3 — SSL**

Automatic. Vercel issues a Let's Encrypt cert within 60 seconds of DNS propagating. No action needed.

**Step 4 — Set `NEXT_PUBLIC_BASE_URL`**

In Vercel → Settings → Environment Variables:
```
NEXT_PUBLIC_BASE_URL=https://journal.manikantar.in
```
Redeploy so it takes effect.

---

## 7. Automation setup (n8n)

**Option A — Railway (easiest, ~$5/mo)**

1. https://railway.app → **New Project → Deploy from template → n8n**
2. Set environment variables:
   - `N8N_HOST=n8n.manikantar.in`
   - `N8N_PROTOCOL=https`
   - `WEBHOOK_URL=https://n8n.manikantar.in`
   - `GENERIC_TIMEZONE=Asia/Kolkata`
3. Add persistent volume `/home/node/.n8n`
4. Add custom domain `n8n.manikantar.in` (CNAME already added in §6)
5. Open `n8n.manikantar.in` → create your admin user

**Option B — Self-host with Docker**

```bash
docker compose -f docker/docker-compose.yml up -d n8n
```

**Wire n8n → Manii's Journal**

In n8n, create a workflow:
1. **Trigger** — Webhook (n8n gives you a URL like `https://n8n.manikantar.in/webhook/manii`)
2. **Action** — HTTP Request POST to `https://journal.manikantar.in/api/inbox/webhook?secret=YOURSECRET`
3. Save + activate

Now in the Journal admin → **Settings → n8n Webhook URL** paste your n8n URL. Every article publish will POST to n8n.

**Google Sheets → Content Inbox** (no n8n needed)

1. Admin → Content Inbox → expand "Sync from Google Sheets or n8n" → click **Generate Secret**
2. Copy the URL shown
3. In your Google Sheet: **Extensions → Apps Script** → paste the pre-generated snippet
4. Set columns to: `type | content | section | notes`
5. Click **Run** in Apps Script — approve permissions
6. **Triggers → Add Trigger** → `pushToJournal` → **On change** (fires when you add rows)

Every row you add to the sheet becomes an Inbox item you approve manually.

---

## 8. Social media setup

### LinkedIn

1. https://developer.linkedin.com/apps → **Create app**
2. App name: "Manii's Journal"
3. LinkedIn Page: your personal profile
4. **Products → Share on LinkedIn** → request access (usually instant)
5. **Auth → OAuth 2.0 → Redirect URLs**: `https://journal.manikantar.in/api/auth/linkedin/callback`
6. Under **Auth → OAuth 2.0 scopes**, ensure `w_member_social` is checked
7. Generate an access token using the LinkedIn OAuth 2.0 flow (use their [Postman collection](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication) — one-time)
8. Get your `Actor URN`: `curl -H "Authorization: Bearer YOUR_TOKEN" https://api.linkedin.com/v2/me` — copy the `id`, format as `urn:li:person:XXXXX`
9. In Journal Admin → Settings → paste `LinkedIn Access Token` and `LinkedIn Actor URN`
10. Test: Social Queue → any approved post → **Publish Now**

### Instagram (Meta Graph API)

Prerequisites: Instagram Business account linked to a Facebook Page.

1. https://developers.facebook.com → **Create app** → type **Business**
2. **Add product → Instagram Graph API**
3. **App Settings → Basic** — save App ID and App Secret
4. **Add product → Facebook Login for Business** — set redirect: `https://journal.manikantar.in/api/auth/instagram/callback`
5. **App Review → Permissions** — request `instagram_content_publish`, `instagram_basic`, `pages_show_list` (Meta review takes 1–5 days)
6. Once approved, use their [Graph API Explorer](https://developers.facebook.com/tools/explorer) to generate a long-lived Page access token
7. Your Instagram Business Account ID: `curl "https://graph.facebook.com/v18.0/me/accounts?access_token=YOUR_TOKEN"` — pick the `instagram_business_account.id`
8. Paste both in Journal Admin → Settings

**Testing without live credentials**: the queue already generates full LinkedIn captions + Instagram carousel copy. Click **Publish Now** — you'll get `credentials_missing` errors until step 8 above is done, but every other action (approve, reject, schedule, edit) works today.

---

## 9. Production checklist

Print this. Tick as you go.

**Infrastructure**
- [ ] GitHub repo created and code pushed
- [ ] Vercel project connected + auto-deploy on `main` push
- [ ] Supabase project created, schema.sql + seed.sql applied
- [ ] Storage buckets created (`article-covers`, `journal-photos`, `media-library`)

**Environment**
- [ ] All required env vars set in Vercel (§2)
- [ ] `DB_DRIVER=supabase` in production
- [ ] `NEXT_PUBLIC_BASE_URL` set to your domain
- [ ] `CRON_SECRET` set (generated with `openssl rand -hex 32`)

**Domain**
- [ ] `journal.manikantar.in` → CNAME to Vercel
- [ ] SSL certificate active (Vercel does this automatically)
- [ ] `admin.` and `api.` subdomains configured

**Content**
- [ ] Groq API key added in Admin → Settings
- [ ] Author photo URL set (Admin → Settings → Author Photo URL)
- [ ] At least 5 real articles generated and published

**Automation**
- [ ] Vercel Cron enabled (auto — verify at Vercel → Cron Jobs)
- [ ] Content Inbox webhook secret generated
- [ ] Google Apps Script pasted in your Sheet (optional)
- [ ] n8n deployed at `n8n.manikantar.in` (optional)

**Social**
- [ ] LinkedIn token + actor URN in Settings
- [ ] Instagram token + business account ID in Settings (after Meta review)
- [ ] Test post approved and published successfully

**SEO & Analytics**
- [ ] `sitemap.xml` accessible at `https://journal.manikantar.in/sitemap.xml`
- [ ] RSS feed accessible at `https://journal.manikantar.in/rss.xml`
- [ ] Google Search Console verified and sitemap submitted
- [ ] Umami/GA connected (optional)

**Backups & Monitoring**
- [ ] Supabase automatic daily backups verified in dashboard
- [ ] Weekly `pg_dump` cron running on a separate machine
- [ ] Vercel deployment notifications enabled (email or Slack)
- [ ] Uptime monitor set up (recommend https://uptimerobot.com — free)

---

## 10. Future maintenance

**Daily rhythm**
- Add rows to your Google Sheet, or use `/admin` → Content Inbox
- Process one or two → drafts appear in Drafts tab
- Review, edit, click **Publish**
- Approve queued social posts → **Publish Now** or **Schedule**

**Weekly**
- Send the newsletter (Admin → Drafts, hit `POST /api/automation/newsletter-send` when ready)
- Check Automation Logs for any failed jobs
- Skim Google Search Console for indexing issues

**Updating the app**

```bash
git pull origin main       # get latest changes
yarn install               # install any new deps
git push origin main       # Vercel auto-deploys
```

For breaking changes, always test in a preview deploy first (Vercel makes one per PR automatically).

**Adding features**

The code is organised as a **monorepo-ready** layout:
- Frontend changes → `app/`
- Business logic → `packages/{db,ai,social,automation}/`
- New DB tables → add to `packages/db/schema.sql`, run in Supabase Studio
- New API endpoints → add branches in `app/api/[[...path]]/route.js`

**Restoring from backup**

```bash
psql "$SUPABASE_DB_URL" < backup-2026-07-17.sql
```

**Migrating away from Supabase** (e.g. to your own Postgres VPS)

Because everything goes through `packages/db`, you only need to:
1. `pg_dump` from Supabase → `pg_restore` to your new Postgres
2. Change `SUPABASE_URL` env var to point at your new Postgres via a PgBouncer / direct connection
3. Redeploy

**Migrating away from Vercel**

Deploy the same repo to Railway/Render/your own VPS:
```bash
docker compose -f docker/docker-compose.yml up -d
```
Everything runs. You lose zero data, zero URLs.

---

## Emergency contacts (bookmark these)

- Vercel status: https://www.vercel-status.com
- Supabase status: https://status.supabase.com
- Groq status: https://status.groq.com
- Your Vercel dashboard: https://vercel.com/YOUR_USERNAME/maniis-journal
- Your Supabase dashboard: https://supabase.com/dashboard/project/YOUR_PROJECT

## FAQ

**Q: I broke something in production. How do I roll back?**
Vercel → Deployments → find the last good one → **Promote to Production**. ~10 seconds.

**Q: Groq is rate-limiting me. What now?**
Add an OpenRouter key in Settings. The AI code falls back automatically.

**Q: My cover images look repetitive.**
Pollinations uses a seed derived from the prompt. Add more variation in the AI Studio "Angle" field, or regenerate.

**Q: Can I sell subscriptions?**
Yes — add Stripe to `packages/` as a new module. The `subscribers` table already has a `metadata` JSONB column for Stripe customer IDs.

**Q: Emergent went down / I want to leave right now.**
You already can. `git clone` this repo, `docker compose up`, done. Your data lives in your own MongoDB or Supabase — never touched by Emergent's infra.

---

You now own MANII'S JOURNAL end-to-end. Ship weekly. Compound quietly.
