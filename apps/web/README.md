# apps/web

The Next.js 15 web application currently lives at the **repo root** (`/app`) for
the Emergent preview environment. To promote to a full monorepo layout:

```bash
# from repo root
mkdir -p apps/web
mv app package.json yarn.lock next.config.mjs tailwind.config.js postcss.config.js \
   lib components apps/web/
cat > package.json <<'JSON'
{ "name": "maniis-journal", "private": true, "workspaces": ["apps/*", "packages/*"] }
JSON
```

The `/packages` directory is already positioned correctly and requires no changes.
