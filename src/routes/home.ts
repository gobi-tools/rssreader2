import { Hono } from "hono";
import { requireAuth, type AuthedEnv } from "../middleware/session.js";
import { listSections } from "../sections.js";
import r from '../frontend/react-srv.js';
import Home from "../frontend/pages/Home.js";

export const homeRoutes = new Hono<AuthedEnv>()
  .get('/', requireAuth, async (c) => {
      const sections = await listSections(c.var.user.id);
      return c.html(r.render(Home, { sections }));
  });