import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { auth } from './auth.js';
import { authRoutes } from './routes/auth.js';
import { session } from './middleware/session.js';
import { profileRoutes } from './routes/profile.js';
import { feedsRoutes } from './routes/feeds.js';
import { homeRoutes } from './routes/home.js';
import { sectionsRoutes } from './routes/sections.js';

export const app = new Hono()
  .use('/*', serveStatic({ root: './public' }))
  .on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
  .use(session).route('/', authRoutes)
  .use(session).route('/home', homeRoutes)
  .use(session).route('/profile', profileRoutes)
  .use(session).route('/feeds', feedsRoutes)
  .use(session).route('/sections', sectionsRoutes);

export type AppType = typeof app;