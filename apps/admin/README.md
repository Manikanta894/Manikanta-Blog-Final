# apps/admin (optional)

Currently the admin surface is served from `/admin` inside the main Next.js app.
If you want to split it into a separate build (different domain, different auth
posture, smaller bundle), duplicate the web app here and:

- Remove all `app/(public)` routes
- Keep `app/admin/*` and `app/api/*`
- Restrict cookies/auth to admins only
- Deploy under `studio.your-domain.com`

All business logic already lives in `/packages/*`, so this is a shallow copy.
