# apps/api (optional)

When your automation load exceeds what serverless routes handle comfortably
(long-running RSS ingest, image processing, newsletter blasts), promote a
standalone API service here.

Recommended stack: **Hono on Node/Bun** or **Fastify**. Import from `/packages`
unchanged.

```js
// apps/api/src/index.js
import { Hono } from 'hono';
import { db } from '../../packages/db/index.js';
import { pipelinePublish } from '../../packages/automation/index.js';

const app = new Hono();
app.get('/health', (c) => c.json({ ok: true }));
app.post('/ai/generate', async (c) => {
  const b = await c.req.json();
  return c.json(await pipelinePublish(b));
});
export default app;
```

Run with `bun run src/index.js` or containerise for Railway/Fly/Render.
