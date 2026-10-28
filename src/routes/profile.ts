import r from '../frontend/react-srv.js';
import Profile from "../frontend/pages/Profile.js";
import { Hono } from 'hono';
import { requireAuth, type AuthEnv } from '../middleware/session.js';

const renderProfile = (email?: string) =>
  r.render(Profile, { email });

export const profileRoutes = new Hono<AuthEnv>()
  .get('/', requireAuth, (c) => c.html(renderProfile(c.var?.user?.email)))