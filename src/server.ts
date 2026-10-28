import { serve } from '@hono/node-server';
import { app } from './app.js';
import { refreshFeeds } from './feeds.js';

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

const refresh = () => refreshFeeds().catch((error) => console.error(`[refresh] failed`, error));
refresh();
setInterval(refresh, 60 * 60 * 1000); // every hour