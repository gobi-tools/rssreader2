import r from '../frontend/react-srv.js';
import Profile from "../frontend/pages/Profile.js";
import { Hono } from 'hono';
import { requireAuth, type AuthedEnv } from '../middleware/session.js';

export const profileRoutes = new Hono<AuthedEnv>()
  .get('/', requireAuth, (c) => c.html(r.render(Profile, { email: c.var.user.email })));