# Enabling manual image uploads (one-time setup, free tier)

The new `/api/upload` route and the Editor / Media Library tabs need a public
Supabase Storage bucket to hold uploaded images. This costs nothing on
Supabase's free tier (1GB storage, 2GB egress/month).

## 1. Create the bucket

In your Supabase project dashboard:

1. Go to **Storage** → **New bucket**.
2. Name it exactly `media`.
3. Toggle **Public bucket** = ON (so images are viewable on the live site
   without extra signed-URL code).
4. Create.

## 2. Add a public-read policy (if not automatic)

Public buckets already allow public `SELECT`/read by default. If you ever
switch it to private, add this policy so the app can still upload
(uploads always go through the server-side service-role key, which
bypasses RLS anyway):

```sql
-- Only needed if you want authenticated users besides the server to upload.
-- The app's own uploads always use the service-role key and don't need this.
create policy "Public read access"
on storage.objects for select
using ( bucket_id = 'media' );
```

## 3. Environment variables

Make sure these are already set (they should be, since the rest of the app
already uses Supabase):

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Optional override if you want a different bucket name:

```
SUPABASE_MEDIA_BUCKET=media
```

## 4. Using it

- **Admin → Editor → Cover Image → Upload**: uploads a photo from your
  computer and sets it as the article's cover image.
- **Admin → Editor → Insert Image** (above the content box): uploads a photo
  and inserts `![alt text](url)` directly into the markdown at your cursor.
- **Admin → Media Library → Upload Your Own Photo**: uploads into the shared
  library; click **Copy URL** on any image to paste it manually anywhere.

Max upload size is 8MB per image (configurable in `app/api/upload/route.js`).
