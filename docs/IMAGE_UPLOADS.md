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

## Cloudflare R2 (recommended persistent storage)

The app now prefers Cloudflare R2 for media storage. R2 is S3-compatible and
works with the same server-side upload flow. The bucket should stay **private**;
images and PDFs are delivered through the app proxy at `/api/media/file?key=...`.

### Required environment variables

Set these in `.env.local` (server-side only; never expose them to the browser):

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=your-bucket-name
```

Optional:

```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_REGION=auto
R2_PUBLIC_BASE_URL=https://your-public-r2-domain
```

If `R2_ENDPOINT` is omitted, it is derived from `R2_ACCOUNT_ID`.
`R2_PUBLIC_BASE_URL` is optional and only needed if you later switch to direct
public R2 URLs. The default safe delivery mode is the app proxy.

### Bucket setup

1. Create an R2 bucket in the Cloudflare dashboard.
2. Keep it private (do not enable public access).
3. Create an R2 API token with read/write access to that bucket.
4. Add the variables above to `.env.local`.
5. Restart the app.

### Behavior

- Images: max 8MB.
- PDFs: max 25MB.
- Allowed MIME types are enforced by the upload route.
- Object keys are UUID-based with date prefixes.
- Metadata is stored in the configured database (Mongo/Supabase/demo).
- No base64 or in-memory fallback is used when R2 is configured.
- Admin Media Library supports upload and delete for images and PDFs.

### Public image display

Images are displayed through `/api/media/file?key=...`, so no public bucket is
required. If you want direct public R2 URLs instead, configure a custom domain
and set `R2_PUBLIC_BASE_URL`; the upload route would then need to be adjusted to
return direct public URLs.
