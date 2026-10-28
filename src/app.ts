import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { auth } from './auth.js';
import { authRoutes } from './routes/auth.js';
import { session } from './middleware/session.js';

export const app = new Hono()
  .use('/*', serveStatic({ root: './public' }))
  .on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))
  .use(session).route('/', authRoutes);

export type AppType = typeof app;