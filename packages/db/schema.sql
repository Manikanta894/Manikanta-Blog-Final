-- ============================================================
-- MANII'S JOURNAL — PostgreSQL / Supabase schema
-- Applied via `psql < schema.sql` or Supabase Studio SQL editor.
-- Requires Postgres 14+ with the `pgcrypto` extension (bundled with Supabase).
-- ============================================================

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- ==================== PROFILES ====================
-- Users are managed by Supabase Auth (auth.users). Profiles hold app-specific data.
create table if not exists public.profiles (
  id uuid primary key,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  role text default 'reader' check (role in ('reader','editor','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If Supabase Auth is enabled, wire the FK to auth.users:
-- alter table public.profiles add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;

-- ==================== CATEGORIES / TAGS ====================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kicker text,
  description text,
  accent text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz default now()
);

-- ==================== ARTICLES ====================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  section text not null,
  category_id uuid references public.categories(id) on delete set null,
  excerpt text,
  content text,
  cover_image text,
  hashtags text[] default array[]::text[],
  seo jsonb default '{}'::jsonb,
  social_posts jsonb default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  published_at timestamptz,
  scheduled_for timestamptz,
  author_id uuid,
  provider text,
  reading_minutes int,
  meta jsonb default '{}'::jsonb,
  search_vector tsvector,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists articles_section_idx on public.articles (section);
create index if not exists articles_status_idx on public.articles (status);
create index if not exists articles_pub_idx on public.articles (published_at desc);
create index if not exists articles_search_idx on public.articles using gin (search_vector);

create or replace function public.articles_search_update() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.content,'')), 'C');
  new.updated_at := now();
  return new;
end $$ language plpgsql;

drop trigger if exists articles_search_trg on public.articles;
create trigger articles_search_trg
  before insert or update on public.articles
  for each row execute function public.articles_search_update();

create table if not exists public.article_tags (
  article_id uuid references public.articles(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- ==================== JOURNAL ====================
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  content text,
  mood text,
  photos text[] default array[]::text[],
  voice_note_url text,
  reflections text,
  lessons text,
  memories text[] default array[]::text[],
  entry_date timestamptz default now(),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists journal_user_date_idx on public.journal_entries (user_id, entry_date desc);

-- ==================== PROJECTS ====================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text,
  content text,
  cover_image text,
  links jsonb default '{}'::jsonb,
  tech_stack text[] default array[]::text[],
  status text default 'active',
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==================== MEDIA ====================
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text,
  type text default 'image' check (type in ('image','video','audio','doc')),
  name text,
  prompt text,
  provider text,
  size_bytes int,
  width int,
  height int,
  alt text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ==================== SOCIAL ====================
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  platform text not null check (platform in ('linkedin','instagram','twitter','threads','facebook')),
  content jsonb not null,
  status text default 'draft',
  external_id text,
  external_url text,
  posted_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.social_queue (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  platform text not null,
  content jsonb not null,
  status text default 'pending' check (status in ('pending','scheduled','posting','posted','failed','cancelled')),
  scheduled_at timestamptz,
  attempted_at timestamptz,
  posted_at timestamptz,
  external_id text,
  attempts int default 0,
  error text,
  created_at timestamptz default now()
);
create index if not exists social_queue_status_idx on public.social_queue (status, scheduled_at);

-- ==================== SUBSCRIBERS / NEWSLETTERS ====================
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  status text default 'active' check (status in ('active','unsubscribed','bounced')),
  source text,
  metadata jsonb default '{}'::jsonb,
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  content text,
  html text,
  status text default 'draft' check (status in ('draft','scheduled','sending','sent','failed')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipient_count int default 0,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ==================== ANALYTICS ====================
-- Umami handles heavy analytics. This table is for lightweight in-app events.
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  path text,
  article_id uuid references public.articles(id) on delete set null,
  session_id text,
  referrer text,
  user_agent text,
  ip_hash text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists analytics_article_idx on public.analytics (article_id, created_at desc);
create index if not exists analytics_event_idx on public.analytics (event, created_at desc);

-- ==================== AUTOMATIONS ====================
create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('rss_ingest','ai_generate','social_post','newsletter_send','custom')),
  status text default 'active' check (status in ('active','paused','disabled')),
  schedule text,
  config jsonb default '{}'::jsonb,
  last_run timestamptz,
  next_run timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid references public.automations(id) on delete cascade,
  action text not null,
  status text check (status in ('ok','failed','warn','info')),
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.ai_queue (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  section text,
  prompt text,
  status text default 'pending' check (status in ('pending','running','done','failed')),
  result jsonb,
  provider text,
  article_id uuid references public.articles(id) on delete set null,
  error text,
  created_at timestamptz default now()
);

create table if not exists public.rss_sources (
  id uuid primary key default gen_random_uuid(),
  name text,
  url text unique not null,
  section text,
  active boolean default true,
  last_fetched timestamptz,
  last_status text,
  created_at timestamptz default now()
);

-- ==================== SETTINGS ====================
create table if not exists public.settings (
  id text primary key default 'global',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ==================== RLS POLICIES ====================
-- Enable RLS on user-facing tables. Service-role bypasses RLS.
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.journal_entries enable row level security;
alter table public.subscribers enable row level security;
alter table public.settings enable row level security;
alter table public.social_queue enable row level security;
alter table public.projects enable row level security;
alter table public.media enable row level security;

-- Articles: public can read published; editors/admins can do anything.
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles
  for select using (status = 'published');

drop policy if exists articles_admin_all on public.articles;
create policy articles_admin_all on public.articles
  for all
  using (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'))
  with check (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'));

-- Projects: public read, admin write
drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select using (true);
drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects for all
  using (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'))
  with check (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'));

-- Journal: owner-only
drop policy if exists journal_owner on public.journal_entries;
create policy journal_owner on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Profiles
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles for select using (true);
drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles for update using (auth.uid() = id);

-- Subscribers: public can insert (newsletter signup), admins can read
drop policy if exists subs_public_insert on public.subscribers;
create policy subs_public_insert on public.subscribers for insert with check (true);
drop policy if exists subs_admin_read on public.subscribers;
create policy subs_admin_read on public.subscribers for select
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

-- Settings: admin only
drop policy if exists settings_admin on public.settings;
create policy settings_admin on public.settings for all
  using (coalesce((auth.jwt() ->> 'role'), '') = 'admin')
  with check (coalesce((auth.jwt() ->> 'role'), '') = 'admin');

-- Media: public read, admin write
drop policy if exists media_public_read on public.media;
create policy media_public_read on public.media for select using (true);
drop policy if exists media_admin_write on public.media;
create policy media_admin_write on public.media for all
  using (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'))
  with check (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'));

-- Social queue: admin only
drop policy if exists sq_admin on public.social_queue;
create policy sq_admin on public.social_queue for all
  using (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'))
  with check (coalesce((auth.jwt() ->> 'role'), '') in ('admin','editor'));
